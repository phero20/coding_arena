import { Worker } from "bullmq";
import { contestSyncQueue } from "../../libs/core/queue";
import { container } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { config } from "../../configs/env";

const logger = createLogger("contest-worker");

// 1. Extract dependencies
const { contestService } = container.cradle;

/**
 * Contest Worker
 * Handles periodic synchronization of external contests.
 */
export const contestWorker = new Worker(
  "contest-sync",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Processing contest sync job");
    
    try {
      await contestService.syncExternalContests();
      logger.info("Contest synchronization job completed successfully");
    } catch (err) {
      logger.error({ err }, "Contest synchronization job failed");
      throw err;
    }
  },
  {
    connection: contestSyncQueue.opts.connection,
    concurrency: 1, // Only one sync at a time
  }
);

/**
 * Initialize Repeatable Job
 * Schedules the sync to run every 6 hours.
 */
export const initContestSyncSchedule = async () => {
  // CRON: 0 */6 * * * (Every 6 hours)
  const cron = "0 */6 * * *";
  
  try {
    // Remove existing repeatable jobs to avoid duplicates on restart
    const repeatableJobs = await contestSyncQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await contestSyncQueue.removeRepeatableByKey(job.key);
    }

    await contestSyncQueue.add(
      "periodic-sync", 
      {}, 
      {
        repeat: { pattern: cron }
      }
    );

    // Trigger an immediate one-time sync on startup so we have data right away
    await contestSyncQueue.add("initial-sync", {});
    
    logger.info({ cron }, "Contest sync schedule initialized and initial sync triggered");
  } catch (err) {
    logger.error({ err }, "Failed to initialize contest sync schedule");
  }
};

// Event Listeners
contestWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Contest sync job finished");
});

contestWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Contest sync job failed");
});

export default contestWorker;
