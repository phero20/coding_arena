import { BaseController } from './base.controller'
import type { Context } from 'hono'
import type { AppEnv, ValidatedContext } from '../types/hono.types'
import type { RunSubmissionInput, SubmitSubmissionInput } from '../validators/submission.validator'
import type { SubmissionService } from '../services/submission.service'
import type { ExecutionService } from '../services/execution.service'
import type { Queue } from 'bullmq'
import { AppError } from '../utils/app-error'
import type { SubmissionEvaluationJob } from '../types/queue.types'
import { createLogger } from '../libs/logger'

export class SubmissionController extends BaseController {
  private readonly logger = createLogger('submission-controller')

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly executionService: ExecutionService,
    private readonly queue: Queue,
  ) {
    super();
  }

  async run(c: Context<AppEnv, any, ValidatedContext<RunSubmissionInput>>) {
    const auth = this.getAuth(c);
    const body = this.getBody(c);
    const { problemId, languageId, sourceCode } = body;

    const result = await this.executionService.runSamples({
      problemId,
      userId: auth.user.id,
      languageId,
      sourceCode,
    })

    return this.created(c, result);
  }

  async submit(c: Context<AppEnv, any, ValidatedContext<SubmitSubmissionInput>>) {
    const auth = this.getAuth(c);
    const body = this.getBody(c);
    const { problemId, languageId, sourceCode, arenaMatchId } = body;

    // 1. High-Performance Pre-Check: Block if already submitted
    if (arenaMatchId) {
      try {
        const match = await this.submissionService.getArenaMatchById(arenaMatchId);
        if (match) {
          const playerIdentifier = auth.clerkUserId || auth.user.id;
          
          // A. Fast Check: Redis (Source of Truth for live status)
          const room = await this.submissionService.getArenaRoom(match.roomId);
          if (room && room.players[playerIdentifier]?.status === 'SUBMITTED') {
            throw AppError.forbidden('Submission already recorded for this match.');
          }

          // B. Safety Check: Mongo (Permanent Record)
          const currentPlayer = match.players.find((p: any) => p.userId === playerIdentifier);
          if (currentPlayer && currentPlayer.verdict !== 'NOT_SUBMITTED') {
            throw AppError.forbidden('Submission already recorded for this match.');
          }
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        this.logger.error({ arenaMatchId, err }, 'Failed to perform pre-submission check');
      }
    }

    const submission = await this.submissionService.createSubmission({
      problemId,
      userId: auth.user.id,
      languageId,
      sourceCode,
      status: 'PENDING',
    })

    const jobData: SubmissionEvaluationJob = {
      submissionId: submission.id,
      problemId,
      languageId,
      sourceCode,
      userId: auth.user.id,
      arenaMatchId,
      clerkId: auth.clerkUserId,
      createdAt: Date.now(),
    }

    try {
      await this.queue.add('evaluate-submission', jobData, { jobId: submission.id })
      this.logger.info({ submissionId: submission.id, problemId, userId: auth.user.id }, 'Submission queued for evaluation')
    } catch (err) {
      this.logger.error({ submissionId: submission.id, err }, 'Failed to queue submission for evaluation')
      throw AppError.internal('Failed to queue submission for evaluation. Please try again.')
    }

    return this.created(c, {
      submissionId: submission.id,
      status: 'PENDING',
      message: 'Submission queued for evaluation. Check status with submission ID.',
    });
  }

  async getSubmissionStatus(c: Context<AppEnv>) {
    const auth = this.getAuth(c);

    const submissionId = c.req.param('submissionId')
    if (!submissionId) throw AppError.badRequest('Missing submissionId parameter')

    const submission = await this.submissionService.getSubmissionById(submissionId)
    if (!submission) throw AppError.notFound(`Submission ${submissionId} not found`)

    if (submission.userId !== auth.user.id) {
      throw AppError.forbidden('You do not have access to this submission')
    }

    return this.ok(c, submission);
  }

  async getUserSubmissions(c: Context<AppEnv>) {
    const auth = this.getAuth(c);

    const problemId = c.req.param('problemId')
    if (!problemId) throw AppError.badRequest('Missing problemId parameter')

    const submissions = await this.submissionService.getUserSubmissions(auth.user.id, problemId, auth.clerkUserId)
    return this.ok(c, submissions);
  }
}
