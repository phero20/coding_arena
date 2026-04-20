import { mongoose } from "../../mongo/connection";
import { redis } from "./redis";
import { logger } from "../utils/logger";

type ShutdownHandler = () => Promise<void> | void;
const shutdownHandlers: { name: string; handler: ShutdownHandler }[] = [];

/**
 * Global Process Guards
 * Catches unhandled exceptions and rejections that bypass Hono's logic.
 */
export function initResilience() {
  process.on("uncaughtException", (err) => {
    logger.fatal(err, "Uncaught Exception detected! Shutting down...");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled Rejection detected! Shutting down...");
    process.exit(1);
  });

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

/**
 * Register a cleanup function to be executed during shutdown.
 * Useful for closing workers, clearing local caches, etc.
 */
export function registerShutdownHandler(
  name: string,
  handler: ShutdownHandler,
) {
  shutdownHandlers.push({ name, handler });
}

/**
 * Graceful Shutdown Sequence
 * Ensures all database and Redis connections are closed cleanly.
 */
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Allow 5s for active work to drain
  const timeout = setTimeout(() => {
    logger.warn("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 5000);

  try {
    // 1. Drain Shutdown Handlers (Workers, etc.)
    for (const { name, handler } of shutdownHandlers) {
      try {
        logger.info(`Executing shutdown handler: ${name}...`);
        await handler();
      } catch (err) {
        logger.error({ name, err }, "Shutdown handler failed.");
      }
    }

    // 2. Disconnect Databases
    await mongoose.disconnect();
    logger.info("MongoDB connection closed.");

    await redis.quit();
    logger.info("Redis connection closed.");

    clearTimeout(timeout);
    logger.info("Shutdown complete.");
    process.exit(0);
  } catch (err) {
    logger.error(err, "Error during shutdown");
    process.exit(1);
  }
}
