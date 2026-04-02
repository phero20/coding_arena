import { JobFailureEvent } from "../../types/queue.types";
import { createLogger } from "../../libs/logger";

const logger = createLogger("submission-events");

export function setupWorkerEvents(worker: any, queue: any) {
  worker.on("error", (err: Error) => {
    logger.error({ err }, "Worker error occurred");
  });

  worker.once("ready", () => {
    logger.info("Submission worker ready and listening for jobs");
  });

  queue.on("failed", (job: any, err: Error) => {
    const failureEvent: JobFailureEvent = {
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      error: err,
      isRateLimitError: err.message?.includes("429"),
      isNetworkError:
        err.message?.includes("ECONNREFUSED") || err.message?.includes("timeout"),
    };

    logger.error(failureEvent, "Job failed after all retry attempts");
  });

  queue.on("stalled", (jobId: string) => {
    logger.warn({ jobId }, "Job stalled - taking longer than expected");
  });

  queue.on("completed", (job: any) => {
    logger.info(
      {
        jobId: job.id,
        duration:
          job.finishedOn && job.processedOn
            ? job.finishedOn - job.processedOn
            : 0,
      },
      "Job completed successfully",
    );
  });
}
