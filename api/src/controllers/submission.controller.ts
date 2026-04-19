import { BaseController } from "./base.controller";
import type { ControllerRequest } from "../types/hono.types";
import type {
  RunSubmissionInput,
  SubmitSubmissionInput,
} from "../validators/submission.validator";
import type { SubmissionService } from "../services/submission.service";
import type { ExecutionService } from "../services/execution.service";
import type { Queue } from "bullmq";
import { AppError } from "../utils/app-error";
import { ERRORS } from "../constants/errors";
import type { SubmissionEvaluationJob } from "../types/queue.types";
import { createLogger } from "../libs/logger";
import type { MatchValidatorService } from "../services/match-validator.service";
import type { ProblemValidatorService } from "../services/problem-validator.service";

/**
 * SubmissionController handles code execution runs and official match submissions.
 * Refactored to use standard DTOs for improved testability and decoupling.
 */
export class SubmissionController extends BaseController {
  private readonly logger = createLogger("submission-controller");

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly executionService: ExecutionService,
    private readonly submissionQueue: Queue,
    private readonly matchValidatorService: MatchValidatorService,
    private readonly problemValidatorService: ProblemValidatorService,
  ) {
    super();
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
    await this.problemValidatorService.validateProblemExists(problemId);

    if (arenaMatchId) {
      await this.matchValidatorService.validateSubmissionEligibility(
        arenaMatchId,
        req.user!.id,
        req.clerkUserId,
      );
    }

    const submission = await this.submissionService.createSubmission({
      problemId,
      userId: req.user!.id,
      languageId,
      sourceCode,
      status: "PENDING",
    });

    const jobData: SubmissionEvaluationJob = {
      submissionId: submission.id,
      problemId,
      languageId,
      sourceCode,
      userId: req.user!.id,
      arenaMatchId,
      clerkId: req.clerkUserId,
      requestId: req.requestId,
      createdAt: Date.now(),
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
}
