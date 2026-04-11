import { connectMongo } from "./mongo/connection";
import "./workers/submission.worker";
import { initResilience } from "./libs/resilience";
import { createApp } from "./app";
import { startMatchEnforcer } from "./workers/match-enforcer.worker";

// 1. Initialize DB Connections
void connectMongo();

// 2. Initialize Resilience & Lifecycle Handlers
initResilience();

// 3. Start Background Workers
startMatchEnforcer();

// 4. Create Hono App
const app = createApp();

/**
 * Entry point for Bun runtime
 */
export default {
  fetch: app.fetch,
};
