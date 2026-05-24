import Redis from "ioredis";
import { config } from "../../configs/env";
import Redlock, { Lock } from "redlock";
import { createLogger } from "../utils/logger";

const logger = createLogger("redis-lib");

/**
 * Shared Local Redis client instance (TCP).
 * Points to your Docker Redis container.
 */
const url = config.redisUrl;
if (!url) {
  logger.error("Redis URL not found in environment variables");
  throw new Error("Redis URL not found");
}

/**
 * Redis Connection with pooling configuration.
 * Optimized for clustering (handles multiple worker processes).
 */
export const redis = new Redis(url, {
  // Connection pooling
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  
  // Retry strategy with exponential backoff
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  
  // Timeouts
  commandTimeout: 5000, // 5s timeout for commands
  connectTimeout: 10000, // 10s timeout for initial connection
  
  // Connection behavior
  lazyConnect: false, // Connect immediately on instantiation
  keepAlive: 30000, // Keep-alive ping every 30s
  
  // Pool sizing (auto-managed by ioredis)
  family: 4, // IPv4 preferred
  
  // Logging
  enableOfflineQueue: true,
});

redis.on("connect", () => logger.info("Connected to Redis successfully"));
redis.on("error", (err) => logger.error({ err }, "Redis connection error"));
redis.on("ready", () => logger.debug("Redis client ready for commands"));
redis.on("reconnecting", () => logger.warn("Redis client reconnecting..."));

/**
 * Redlock instance for distributed locking.
 * Handles clock drift and multiple Redis instances (though we only have one).
 */
export const redlock = new Redlock([redis], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
});

/**
 * withLock utility for safer and easier distributed locking.
 * Automatically handles acquisition, execution, and release.
 *
 * @param key Lock key
 * @param ttl Time to live in milliseconds
 * @param fn Callback function to execute holding the lock
 */
export async function withLock<T>(
  key: string,
  ttl: number,
  fn: (lock: Lock) => Promise<T>,
): Promise<T> {
  const resource = `lock:${key}`;
  let lock: Lock | null = null;
  try {
    lock = await redlock.acquire([resource], ttl);
    logger.debug({ key, resource }, "Redlock acquired");
    return await fn(lock);
  } catch (error) {
    logger.error({ key, error }, "Failed to acquire or execute with Redlock");
    throw error;
  } finally {
    if (lock) {
      try {
        await lock.release();
        logger.debug({ key, resource }, "Redlock released");
      } catch (releaseError) {
        // Log but don't throw, as the main function already finished
        logger.warn(
          { key, releaseError },
          "Redlock release failed (possibly expired)",
        );
      }
    }
  }
}

/**
 * Get connection pool metrics for monitoring
 * Useful for detecting connection pool exhaustion
 */
export function getRedisPoolMetrics() {
  const stats = (redis as any).status;
  const connectedClients = (redis as any)._client?.connectionsById?.size || 1;
  
  return {
    status: stats || "unknown",
    connectedClients,
    maxRetriesPerRequest: 3,
    commandTimeout: 5000,
  };
}

/**
 * Pipeline bulk sets for high-throughput cache writes
 * 
 * @param operations Array of objects with key, value (JSON string or primitives), and ttl in seconds
 * @returns Result of the pipeline execution
 */
export async function batchCache(
  operations: Array<{ key: string; value: any; ttl: number }>,
) {
  const pipe = redis.pipeline();

  for (const op of operations) {
    const stringValue =
      typeof op.value === "string" ? op.value : JSON.stringify(op.value);
    pipe.setex(op.key, op.ttl, stringValue);
  }

  return pipe.exec();
}

export default redis;
