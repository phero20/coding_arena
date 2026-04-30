import { connectMongo } from "./mongo/connection";
import "./workers/submission/submission.worker";
import { initResilience } from "./libs/core/resilience";
import { createApp } from "./app";
import { startMatchEnforcer } from "./workers/arena/match-enforcer.worker";
import "./workers/arena/arena-cleanup.worker";
import { logger } from "./libs/utils/logger";

/**
 * Main Application Bootstrap.
 * Coordinates DB connections, workers, and resilience handlers
 * into a single, professional startup sequence.
 */
async function bootstrap() {
  try {
    logger.info("Starting Coding Arena Backend...");

    // 1. Initialize DB Connections
    await connectMongo();
    logger.info("MongoDB Connection Established.");

    // 2. Initialize Resilience & Lifecycle Handlers
    initResilience();

    // 3. Start Background Workers
    startMatchEnforcer();
    logger.info("Background Workers Initialized.");

    logger.info("Bootstrap logic complete systems online.");
  } catch (err) {
    logger.fatal({ err }, "CRITICAL: Application Bootstrap Failed!");
    process.exit(1);
  }
}

// Fire and forget bootstrap
void bootstrap();

const app = createApp();

/**
 * Entry point for Bun runtime
 */
export default {
  port: 3000,
  fetch: app.fetch,
};
