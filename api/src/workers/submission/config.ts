import { WorkerOptions } from "bullmq";
import { config } from "../../configs/env";


const redisUrl = new URL(config.redisUrl || "redis://localhost:6379");
<<<<<<< HEAD
=======
const isSecure = redisUrl.protocol === "rediss:";
>>>>>>> prod-deploy

export const workerOptions: WorkerOptions = {
  connection: {
    host: redisUrl.hostname || "localhost",
    port: parseInt(redisUrl.port || "6379"),
<<<<<<< HEAD
=======
    password: redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined,
    tls: isSecure ? {} : undefined,
>>>>>>> prod-deploy
  },
  concurrency: 10, // Increased to support 200+ active users with minimal queue lag
};


export const WORKER_NAME = "submission-evaluation";
