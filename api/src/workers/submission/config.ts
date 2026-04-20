import { WorkerOptions } from "bullmq";
import { config } from "../../configs/env";


const redisUrl = new URL(config.redisUrl || "redis://localhost:6379");

export const workerOptions: WorkerOptions = {
  connection: {
    host: redisUrl.hostname || "localhost",
    port: parseInt(redisUrl.port || "6379"),
  },
  concurrency: 10, // Increased to support 200+ active users with minimal queue lag
};


export const WORKER_NAME = "submission-evaluation";
