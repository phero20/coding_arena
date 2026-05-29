import { Worker } from "bullmq";
<<<<<<< HEAD
import { config } from "../../configs/env";
=======
import { arenaCleanupQueue } from "../../libs/core/queue";
>>>>>>> prod-deploy
import { container } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { registerShutdownHandler } from "../../libs/core/resilience";

const logger = createLogger("arena-cleanup-worker");

/**
 * Arena Cleanup Worker
 * Responsible for delayed Redis environment purges after match completion.
<<<<<<< HEAD
=======
 * 
 * Uses shared queue connection for consistent pooling across clustered workers.
 * Concurrency: 5 allows 5 parallel cleanups (safe for Redis memory)
>>>>>>> prod-deploy
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
<<<<<<< HEAD
    connection: {
      host:
        new URL(config.redisUrl || "redis://localhost:6379").hostname ||
        "localhost",
      port: parseInt(
        new URL(config.redisUrl || "redis://localhost:6379").port || "6379",
      ),
    },
=======
    connection: arenaCleanupQueue.opts.connection,
>>>>>>> prod-deploy
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
