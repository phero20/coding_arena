import { Worker } from "bullmq";
import { submissionQueue } from "../libs/queue";
import { container } from "../libs/container";

import { workerOptions, WORKER_NAME } from "./submission/config";
import { setupWorkerEvents } from "./submission/events";
import { createSubmissionProcessor } from "./submission/processor";

// 1. Initialize dependencies from the Centralized Container
const { repositories, specialists } = container;

// 2. Initialize internal worker modules
const processor = createSubmissionProcessor(
  repositories.submissionRepository, 
  repositories.arenaMatchRepository,
  repositories.arenaSubmissionRepository,
  repositories.arenaRepository,
  specialists.submissionEvaluator
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
