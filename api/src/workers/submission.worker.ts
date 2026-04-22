import { Worker } from "bullmq";
import { submissionQueue } from "../libs/queue";
import { container } from "../libs/awilix-container";

import { workerOptions, WORKER_NAME } from "./submission/config";
import { setupWorkerEvents } from "./submission/events";
import { createSubmissionProcessor } from "./submission/processor";

// 1. Initialize dependencies from the Awilix Container
const { 
  submissionRepository, 
  arenaMatchService, 
  submissionEvaluator 
} = container.cradle;

// 2. Initialize internal worker modules
const processor = createSubmissionProcessor(
  submissionRepository,
  arenaMatchService,
  submissionEvaluator,
);

// 3. Create and Start Worker
const submissionWorker = new Worker(WORKER_NAME, processor, workerOptions);

// 4. Setup Event Listeners
setupWorkerEvents(submissionWorker, submissionQueue);

// 5. Lifecycle Management
process.on("SIGTERM", async () => {
  await submissionWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await submissionWorker.close();
  process.exit(0);
});

export { submissionWorker };
export default submissionWorker;
