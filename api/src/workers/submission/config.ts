import { WorkerOptions } from "bullmq";
import { config } from "../../configs/env";


const redisUrl = new URL(config.redisUrl || "redis://localhost:6379");
const isSecure = redisUrl.protocol === "rediss:";

export const workerOptions: WorkerOptions = {
  connection: {
    host: redisUrl.hostname || "localhost",
    port: parseInt(redisUrl.port || "6379"),
    password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
    tls: isSecure ? {} : undefined,
  },
  settings: {
    backoffStrategy: (_attemptsMade: any, type: any, err: any) => {
      if (type === "smartRetry") {
        if (err?.message === "VM_WAKING_UP") {
          return 10000; // Wait 10 seconds for VM to wake up
        }
        return 1000; // Wait 1 second for standard transient errors
      }
      return 1000; // default fallback
    },
  },
  concurrency: 10, // Increased to support 200+ active users with minimal queue lag
};


export const WORKER_NAME = "submission-evaluation";
