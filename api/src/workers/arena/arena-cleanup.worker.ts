import { Worker } from "bullmq";
import { arenaCleanupQueue } from "../../libs/core/queue";
import { container } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { registerShutdownHandler } from "../../libs/core/resilience";

const logger = createLogger("arena-cleanup-worker");

/**
 * Arena Cleanup Worker
 * Responsible for delayed Redis environment purges after match completion.
 * 
 * Uses shared queue connection for consistent pooling across clustered workers.
 * Concurrency: 5 allows 5 parallel cleanups (safe for Redis memory)
 */
const cleanupWorker = new Worker(
  "arena-cleanup",
  async (job) => {
    const { roomId } = job.data;
    if (!roomId) return;

    logger.info({ roomId }, "Starting delayed room cleanup...");

    try {
      // Use the resolved repository from Awilix cradle
      await container.cradle.arenaRepository.deleteRoom(roomId);
      logger.info({ roomId }, "Delayed room cleanup complete.");
    } catch (err) {
      logger.error(
        { roomId, err },
        "Failed to perform delayed room cleanup. BullMQ will retry.",
      );
      throw err; // Re-throw triggers BullMQ's automatic retry policy
    }
  },
  {
    connection: arenaCleanupQueue.opts.connection,
    concurrency: 5,
  },
);

cleanupWorker.on("error", (err) => {
  logger.error({ err }, "Worker error in arena-cleanup");
});

registerShutdownHandler("arena-cleanup-worker", async () => {
  await cleanupWorker.close();
});

export default cleanupWorker;
