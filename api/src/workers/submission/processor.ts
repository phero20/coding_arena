import type { Job } from "bullmq";
import type {
  SubmissionEvaluationJob,
  SubmissionEvaluationResult,
} from "../../types/queue.types";
import type { SubmissionRepository } from "../../repositories/submission.repository";
import { ArenaMatchService } from "../../services/arena-match.service";
import { SubmissionEvaluator } from "./evaluator";
import { createLogger } from "../../libs/logger";
import { metrics } from "../../libs/metrics";

const logger = createLogger("submission-processor");
let jobsProcessed = 0;

export function createSubmissionProcessor(
  submissionRepository: SubmissionRepository,
  arenaMatchService: ArenaMatchService,
  evaluator: SubmissionEvaluator,
) {
  return async function processSubmissionJob(
    job: Job<SubmissionEvaluationJob>,
  ): Promise<SubmissionEvaluationResult> {
    const jobData = job.data;
    const requestStartTime = Date.now();
    const traceId = jobData.requestId || `job-${job.id}`;

    // Create a traced child logger for this specific job execution
    const tracedLogger = logger.child({ traceId, submissionId: jobData.submissionId });

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
      const evaluation = await evaluator.evaluate({
        problemId: jobData.problemId,
        languageId: jobData.languageId,
        sourceCode: jobData.sourceCode,
        submissionId: jobData.submissionId,
      });

      const executionTime = Date.now() - requestStartTime;

      // 2. Update standard submission
      await submissionRepository.updateSubmissionStatus({
        id: jobData.submissionId,
        status: evaluation.status,
        details: {
          tests: evaluation.tests,
          evaluatedAt: new Date().toISOString(),
          evaluationDuration: executionTime,
        },
      });

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
        executionTime,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const attemptNumber = job.attemptsMade || 1;
      const maxAttempts = job.opts?.attempts || 3;

      tracedLogger.error(
        {
          jobId: job.id,
          error: errorMessage,
          attempt: attemptNumber,
        },
        "Submission evaluation failed",
      );

      // Handle final failure
      if (attemptNumber >= maxAttempts) {
        tracedLogger.error(
          {
            attempts: attemptNumber,
          },
          "Max retry attempts reached, marking as SYSTEM_ERROR",
        );

        try {
          await submissionRepository.updateSubmissionStatus({
            id: jobData.submissionId,
            status: "SYSTEM_ERROR",
            details: {
              error: errorMessage,
              failedAfterAttempts: attemptNumber,
              evaluatedAt: new Date().toISOString(),
            },
          });
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
