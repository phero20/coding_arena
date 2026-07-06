import { Worker } from "bullmq";
import { config } from "../../configs/env";
import { redis } from "../../libs/core/redis";
import { createLogger } from "../../libs/utils/logger";
import { CloudFactory } from "@slavecode/cloud";
import { vmShutdownQueue } from "../../libs/core/queue";
import { workerOptions } from "../submission/config";

const logger = createLogger("vm-shutdown-worker");

export const vmShutdownWorker = new Worker(
  "vm-shutdown",
  async () => {
    if (!config.judge0VmName) {
      return;
    }

    try {
      const cloud = CloudFactory.getProvider();
      const status = await cloud.getVmStatus(config.judge0VmName);

      // If the VM isn't ON, we don't need to shut it down
      if (status !== "ON") {
        return;
      }

      const lastActiveStr = await redis.get("judge0:last_active");
      if (!lastActiveStr) {
        // If we have no record, it might have just booted up manually or the key expired.
        // We set it to now to give it a fresh 1-hour grace period before checking again.
        await redis.set("judge0:last_active", Date.now().toString());
        return;
      }

      const lastActive = parseInt(lastActiveStr, 10);
      const idleTimeMs = Date.now() - lastActive;
      const timeoutMs = config.judge0VmIdleTimeoutHours * 60 * 60 * 1000;

      if (idleTimeMs > timeoutMs) {
        logger.info(
          { idleTimeMs, vm: config.judge0VmName },
          `Judge0 VM has been idle for over ${config.judge0VmIdleTimeoutHours} hour(s). Deallocating to save Azure costs.`
        );
        await cloud.stopVm(config.judge0VmName);
        await redis.del("judge0:last_active");
      }
    } catch (err) {
      logger.error({ err }, "Failed to process VM shutdown check");
      throw err;
    }
  },
  workerOptions
);

vmShutdownWorker.on("failed", (job, err) => {
  logger.error({ err }, "VM Shutdown check failed");
});

/**
 * Initializes the Cron job to check VM status every 15 minutes
 */
export async function initVmShutdownSchedule() {
  await vmShutdownQueue.add(
    "check-idle",
    {},
    {
      repeat: {
        pattern: "*/15 * * * *", // Runs every 15 minutes
      },
    }
  );
  logger.info("Scheduled Judge0 VM Auto-Shutdown sweeper (Runs every 15m)");
}
