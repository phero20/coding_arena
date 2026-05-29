import type { Job } from "bullmq";
import type {
  SubmissionEvaluationJob,
  SubmissionEvaluationResult,
} from "../../types/infrastructure/queue.types";
import type { SubmissionRepository } from "../../repositories/submissions/submission.repository";
import { ArenaMatchService } from "../../services/arena/arena-match.service";
import { SubmissionEvaluator } from "./evaluator";
import { createLogger } from "../../libs/utils/logger";
import { metrics } from "../../libs/core/metrics";
import type { EvaluationResultData } from "../../types/submissions/submission.types";
import { type StatsSubmissionService } from "../../services/stats/stats-submission.service";

const logger = createLogger("submission-processor");
let jobsProcessed = 0;

import type { IClockService } from "../../services/common/clock.service";

export function createSubmissionProcessor(
  submissionRepository: SubmissionRepository,
  arenaMatchService: ArenaMatchService,
  evaluator: SubmissionEvaluator,
  clock: IClockService,
  statsSubmissionService: StatsSubmissionService,
) {
  return async function processSubmissionJob(
    job: Job<SubmissionEvaluationJob>,
  ): Promise<SubmissionEvaluationResult> {
    const jobData = job.data;
    const requestStartTime = clock.now();
    const traceId = jobData.requestId || `job-${job.id}`;
    const options = { traceId };

    // Create a traced child logger for this specific job execution
    const tracedLogger = logger.child({
      traceId,
      submissionId: jobData.submissionId,
    });

    tracedLogger.info(
      {
        jobId: job.id,
        problemId: jobData.problemId,
        userId: jobData.userId,
      },
      "Evaluating submission",
    );

    try {
      // 1. Evaluate
      const evaluation: EvaluationResultData = await evaluator.evaluate({
        problemId: jobData.problemId,
        languageId: jobData.languageId,
        sourceCode: jobData.sourceCode,
        submissionId: jobData.submissionId,
      });

      const executionTime = clock.now() - requestStartTime;

      // 2. Update standard submission
      const updatedSubmission = await submissionRepository.updateSubmissionStatus(
        {
          id: jobData.submissionId,
          status: evaluation.status,
          details: {
            tests: evaluation.tests,
<<<<<<< HEAD
=======
            compileOutput: evaluation.compileOutput,
            stderr: evaluation.stderr,
>>>>>>> prod-deploy
            evaluatedAt: clock.nowIso(),
            evaluationDuration: executionTime,
          },
        },
        options,
      );

      // 2.5 Trigger Postgres Stats Update
      if (updatedSubmission) {
        // We run stats update in background (don't await) to keep worker fast
        // unless you want to ensure it succeeds before completing the job.
        // Given our standard, we should probably await it here since it's a worker task.
        await statsSubmissionService.handleSubmissionUpdate(updatedSubmission);
      }

      // 3. Match Logic (Delegated to Service)
      if (jobData.arenaMatchId) {
        await arenaMatchService.handleMatchSubmission({
          submissionId: jobData.submissionId,
          matchId: jobData.arenaMatchId,
          userId: jobData.userId,
          clerkId: jobData.clerkId,
          evaluation: {
            status: evaluation.status,
            tests: evaluation.tests,
          },
          traceId,
        });
      }

      tracedLogger.info(
        { status: evaluation.status, duration: executionTime },
        "Submission evaluation complete",
      );

      // 4. Metrics & Monitoring
      metrics.recordVerdict(evaluation.status);
      jobsProcessed++;
      if (jobsProcessed % 10 === 0) {
        metrics.logHealthReport();
      }

      return {
        ...evaluation,
        status: evaluation.status as any, // Terminal status union mismatch
        executionTime,
      } as SubmissionEvaluationResult;
    } catch (error: unknown) {
<<<<<<< HEAD
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const attemptNumber = job.attemptsMade || 1;
=======
      const errorMessage = error instanceof Error ? error.message : String(error);
      const currentAttempt = job.attemptsMade + 1;
>>>>>>> prod-deploy
      const maxAttempts = job.opts?.attempts || 3;

      tracedLogger.error(
        {
          jobId: job.id,
          error: errorMessage,
<<<<<<< HEAD
          attempt: attemptNumber,
=======
          attempt: currentAttempt,
          maxAttempts,
>>>>>>> prod-deploy
        },
        "Submission evaluation failed",
      );

      // Handle final failure
<<<<<<< HEAD
      if (attemptNumber >= maxAttempts) {
        tracedLogger.error(
          {
            attempts: attemptNumber,
=======
      if (currentAttempt >= maxAttempts) {
        tracedLogger.error(
          {
            attempts: currentAttempt,
>>>>>>> prod-deploy
          },
          "Max retry attempts reached, marking as SYSTEM_ERROR",
        );

        try {
          await submissionRepository.updateSubmissionStatus(
            {
              id: jobData.submissionId,
              status: "SYSTEM_ERROR",
              details: {
                error: errorMessage,
<<<<<<< HEAD
                failedAfterAttempts: attemptNumber,
=======
                failedAfterAttempts: currentAttempt,
>>>>>>> prod-deploy
                evaluatedAt: clock.nowIso(),
              },
            },
            options,
          );
<<<<<<< HEAD
=======

          // 3.5 Also notify Match Logic on final failure if it's an arena submission
          if (jobData.arenaMatchId) {
            await arenaMatchService.handleMatchSubmission({
              submissionId: jobData.submissionId,
              matchId: jobData.arenaMatchId,
              userId: jobData.userId,
              clerkId: jobData.clerkId,
              evaluation: {
                status: "SYSTEM_ERROR",
                tests: [],
              },
              traceId,
            });
          }
>>>>>>> prod-deploy
        } catch (dbErr) {
          tracedLogger.error(
            {
              error: errorMessage,
              dbErr: dbErr instanceof Error ? dbErr.message : dbErr,
            },
            "Critical: Failed to update submission status to SYSTEM_ERROR in DB",
          );
        }
      }

      throw error; // Re-throw to trigger BullMQ retry
    }
  };
}
