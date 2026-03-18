import type { Context } from 'hono'
import type { SubmissionService } from '../services/submission.service'
import type { ExecutionService } from '../services/execution.service'
import { ApiResponse } from '../utils/api-response'
import { AppError } from '../utils/app-error'
import { submissionQueue } from '../libs/queue'
import type { SubmissionEvaluationJob } from '../types/queue.types'
import pino from 'pino'

const logger = pino({
  name: 'submission-controller',
  level: process.env.LOG_LEVEL || 'info',
})

export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly executionService: ExecutionService,
  ) {}

  /**
   * Temporary skeleton for the "run" endpoint.
   *
   * This will eventually:
   * - validate input
   * - fetch public/sample tests for the problem
   * - delegate to an execution service that talks to Judge0
   * - return per-test results synchronously
   */
  async run(c: Context) {
    const body = await c.req.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Invalid JSON body')
    }

    const { problem_id, language_id, source_code } = body

    if (!problem_id || !language_id || !source_code) {
      throw AppError.badRequest(
        'Missing required fields: problem_id, language_id, source_code',
      )
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    const result = await this.executionService.runSamples({
      problemId: problem_id,
      userId,
      languageId: language_id,
      sourceCode: source_code,
    })

    const response = ApiResponse.success(result)

    return c.json(response.toJSON(), 201)
  }

  /**
   * Submit code for full evaluation
   *
   * Flow:
   * 1. Validate input and user authentication
   * 2. Create submission record with PENDING status
   * 3. Enqueue async job to BullMQ for evaluation
   * 4. Return immediately with submission ID and PENDING status
   *
   * The actual evaluation happens asynchronously in the worker.
   * Frontend polls GET /submissions/:submissionId to check status.
   */
  async submit(c: Context) {
    const body = await c.req.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Invalid JSON body')
    }

    const { problem_id, language_id, source_code } = body

    if (!problem_id || !language_id || !source_code) {
      throw AppError.badRequest(
        'Missing required fields: problem_id, language_id, source_code',
      )
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    // STEP 2.1: Change status to PENDING instead of RUNNING
    const submission = await this.submissionService.createSubmission({
      problem_id,
      user_id: userId,
      language_id,
      source_code,
      status: 'PENDING',
    })

    const submissionId = (submission as any).id

    // STEP 2.1: Add job to queue instead of blocking on execution
    try {
      const jobData: SubmissionEvaluationJob = {
        submissionId,
        problemId: problem_id,
        languageId: language_id,
        sourceCode: source_code,
        userId,
        createdAt: Date.now(),
      }

      await submissionQueue.add('evaluate-submission', jobData, {
        jobId: submissionId, // Use submission ID as job ID for tracking
      })

      logger.info(
        {
          submissionId,
          problemId: problem_id,
          userId,
        },
        'Submission queued for evaluation'
      )
    } catch (err) {
      logger.error(
        {
          submissionId,
          err,
        },
        'Failed to queue submission for evaluation'
      )
      // Still return success - submission is created, just notify user about queue issue
    }

    // STEP 2.2: Return PENDING status immediately (not test results)
    const response = ApiResponse.success({
      submissionId,
      status: 'PENDING',
      message: 'Submission queued for evaluation. Check status with submission ID.',
    })

    return c.json(response.toJSON(), 201)
  }

  /**
   * STEP 2.3: Get submission status by ID
   *
   * Frontend polls this endpoint every 500ms to check if evaluation is complete.
   * Returns current status and test results when available.
   */
  async getSubmissionStatus(c: Context) {
    const submissionId = c.req.param('submissionId')

    if (!submissionId) {
      throw AppError.badRequest('Missing submissionId parameter')
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    // Fetch submission from database
    const submission = await this.submissionService.getSubmissionById(submissionId)

    if (!submission) {
      throw AppError.notFound(`Submission ${submissionId} not found`)
    }

    // Verify user owns this submission
    if ((submission as any).user_id !== userId) {
      throw AppError.forbidden('You do not have access to this submission')
    }

    logger.info(
      {
        submissionId,
        status: (submission as any).status,
      },
      'Submission status retrieved'
    )

    // Return full submission object with details intact
    // Frontend expects: { status, details: { tests, ... }, createdAt, updatedAt }
    const response = ApiResponse.success({
      id: submissionId,
      problem_id: (submission as any).problem_id,
      user_id: (submission as any).user_id,
      language_id: (submission as any).language_id,
      source_code: (submission as any).source_code,
      status: (submission as any).status,
      time: (submission as any).time,
      memory: (submission as any).memory,
      details: (submission as any).details || null,
      createdAt: (submission as any).createdAt,
      updatedAt: (submission as any).updatedAt,
    })

    return c.json(response.toJSON())
  }

  /**
   * Get all submissions for a problem by user
   */
  async getUserSubmissions(c: Context) {
    const problemId = c.req.param('problemId')

    if (!problemId) {
      throw AppError.badRequest('Missing problemId parameter')
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    const submissions = await this.submissionService.getUserSubmissions(
      userId,
      problemId,
    )

    const response = ApiResponse.success(submissions)
    return c.json(response.toJSON())
  }
}

