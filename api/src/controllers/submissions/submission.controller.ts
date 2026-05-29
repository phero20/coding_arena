import { BaseController } from "../base.controller";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import type {
  RunSubmissionInput,
  SubmitSubmissionInput,
} from "../../validators/submissions/submission.validator";
<<<<<<< HEAD
import type { SubmissionService } from "../../services/submissions/submission.service";
import type { ExecutionService } from "../../services/submissions/execution.service";
=======
import type { ISubmissionService } from "../../services/submissions/submission.service";
import type { IExecutionService } from "../../services/submissions/execution.service";
>>>>>>> prod-deploy
import type { Queue } from "bullmq";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";
import type { SubmissionEvaluationJob } from "../../types/infrastructure/queue.types";
import { createLogger } from "../../libs/utils/logger";
import type { MatchValidatorService } from "../../services/arena/match-validator.service";
import type { ProblemValidatorService } from "../../services/problems/problem-validator.service";

import { type IClockService } from "../../services/common/clock.service";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";

/**
 * SubmissionController handles code execution runs and official match submissions.
 * Refactored to use standard DTOs for improved testability and decoupling.
 */
export class SubmissionController extends BaseController {
  private readonly logger = createLogger("submission-controller");
<<<<<<< HEAD
  private readonly submissionService: SubmissionService;
  private readonly executionService: ExecutionService;
=======
  private readonly submissionService: ISubmissionService;
  private readonly executionService: IExecutionService;
>>>>>>> prod-deploy
  private readonly submissionQueue: Queue;
  private readonly matchValidatorService: MatchValidatorService;
  private readonly problemValidatorService: ProblemValidatorService;
  private readonly clock: IClockService;
  private readonly userRepository: IUserRepository;

  constructor(cradle: ICradle) {
    super(cradle);
    this.submissionService = cradle.submissionService;
    this.executionService = cradle.executionService;
    this.submissionQueue = cradle.submissionQueue;
    this.matchValidatorService = cradle.matchValidatorService;
    this.problemValidatorService = cradle.problemValidatorService;
    this.clock = cradle.clockService;
    this.userRepository = cradle.userRepository;
  }

  async run(req: ControllerRequest<RunSubmissionInput>) {
    const { problemId, languageId, sourceCode } = req.body;

    // 1. Logic Offloading: Validate problem existence
    await this.problemValidatorService.validateProblemExists(problemId);

    return await this.executionService.runSamples({
      problemId,
      userId: req.user!.id,
      languageId,
      sourceCode,
    });
  }

  async submit(req: ControllerRequest<SubmitSubmissionInput>) {
    const { problemId, languageId, sourceCode, arenaMatchId } = req.body;

    // 1. Business Rules: Delegate to Validator Services
    // validateProblemExists returns the full problem so we can denormalize the title
    const problem = await this.problemValidatorService.validateProblemExists(problemId);

    if (arenaMatchId) {
      await this.matchValidatorService.validateSubmissionEligibility(
        arenaMatchId,
        req.user!.id,
        req.clerkUserId,
      );
    }

    const submission = await this.submissionService.createSubmission(
      {
        problemId,
        problemTitle: problem?.title,
        userId: req.user!.id,
        languageId,
        sourceCode,
        status: "PENDING",
      },
      req.requestId,
    );

    const jobData: SubmissionEvaluationJob = {
      submissionId: submission.id,
      problemId,
      languageId,
      sourceCode,
      userId: req.user!.id,
      arenaMatchId,
      clerkId: req.clerkUserId,
      requestId: req.requestId,
      createdAt: this.clock.now(),
    };

    try {
      await this.submissionQueue.add("evaluate-submission", jobData, {
        jobId: submission.id,
      });
      this.logger.info(
        { submissionId: submission.id, problemId, userId: req.user!.id },
        "Submission queued for evaluation",
      );
    } catch (err) {
      this.logger.error(
        { submissionId: submission.id, err },
        "Failed to queue submission for evaluation",
      );
      throw AppError.from(ERRORS.SUBMISSION.QUEUE_FAILED);
    }

    return {
      submissionId: submission.id,
      status: "PENDING",
      message:
        "Submission queued for evaluation. Check status with submission ID.",
    };
  }

  async getSubmissionStatus(
    req: ControllerRequest<never, { submissionId: string }>,
  ) {
    const { submissionId } = req.params;

    const submission =
      await this.submissionService.getSubmissionById(submissionId);

    // 1. Logic Offloading: Delegate ownership check
    await this.matchValidatorService.validateSubmissionOwnership(
      submission,
      req.user!.id,
    );

    return submission;
  }

  async getUserSubmissions(
    req: ControllerRequest<never, { problemId: string }>,
  ) {
    const { problemId } = req.params;

    // 1. Logic Offloading: Validate problem existence
    await this.problemValidatorService.validateProblemExists(problemId);

    return await this.submissionService.getUserSubmissions(
      req.user!.id,
      problemId,
      req.clerkUserId,
    );
  }

  async getRecentSubmissions(
    req: ControllerRequest<never, never, { limit: number; offset: number; username?: string }>,
  ) {
    const { limit, offset, username } = req.query;

    // Use specific target or fallback to current user
    let targetUserId = req.user?.id;

    if (username) {
      const user = await this.userRepository.findByUsername(username);
      if (!user) {
        throw AppError.notFound(`Username @${username} not found`);
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
       // This handles the public access case where neither a username nor a login exists
       return {
         submissions: [],
         pagination: { total: 0, limit, offset }
       };
    }

    return await this.submissionService.getRecentSubmissions(
      targetUserId,
      limit,
      offset,
    );
  }
}
