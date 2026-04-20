import { Worker } from "bullmq";
import { submissionQueue } from "../../libs/core/queue";
import { container } from "../../libs/awilix-container";

import { workerOptions, WORKER_NAME } from "./config";
import { setupWorkerEvents } from "./events";
import { createSubmissionProcessor } from "./processor";
import { registerShutdownHandler } from "../../libs/core/resilience";

// 1. Initialize dependencies from the Awilix Container
const {
  submissionRepository,
  arenaMatchService,
  submissionEvaluator,
  clockService,
  statsSubmissionService,
} = container.cradle;

// 2. Initialize internal worker modules
const processor = createSubmissionProcessor(
  submissionRepository,
  arenaMatchService,
  submissionEvaluator,
  clockService,
  statsSubmissionService,
);

// 3. Create and Start Worker
const submissionWorker = new Worker(WORKER_NAME, processor, workerOptions);

// 4. Setup Event Listeners
setupWorkerEvents(submissionWorker, submissionQueue);

// 5. Lifecycle Management (Delegated to resilience)
registerShutdownHandler("submission-worker", async () => {
  await submissionWorker.close();
});

export { submissionWorker };
export default submissionWorker;
