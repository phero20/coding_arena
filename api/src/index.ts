import { connectMongo } from "./mongo/connection";
import "./workers/submission.worker";
import { initResilience } from "./libs/resilience";
import { createApp } from "./app";

// 1. Initialize DB Connections
void connectMongo();

// 2. Initialize Resilience & Lifecycle Handlers
initResilience();

// 3. Create Hono App
const app = createApp();

/**
 * Entry point for Bun runtime
 */
export default {
  fetch: app.fetch,
};
