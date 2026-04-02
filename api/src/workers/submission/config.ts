import { WorkerOptions } from "bullmq";
import { config } from "../../configs/env";


const redisUrl = new URL(config.redisUrl || "redis://localhost:6379");

export const workerOptions: WorkerOptions = {
  connection: {
    host: redisUrl.hostname || "localhost",
    port: parseInt(redisUrl.port || "6379"),
  },
  concurrency: 1, // Process 1 job at a time to respect Groq rate limits
};


export const WORKER_NAME = "submission-evaluation";
