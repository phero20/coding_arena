import { Redis } from "@upstash/redis";
import { config } from "../configs/env";

/**
 * Shared Redis client instance.
 * Uses Upstash Redis REST API to ensure compatibility across all environments (Local, Bundled, Edge).
 * Configured via UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.
 */
export const redis = new Redis({
  url: config.upstashRedisRestUrl,
  token: config.upstashRedisRestToken,
});

/**
 * Optional: Helper for TCP/node-redis style connections if ever needed,
 * but Upstash REST is preferred for Bun and Serverless.
 */
export default redis;
