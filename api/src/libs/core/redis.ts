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

export const redis = new Redis(url);

redis.on("connect", () => logger.info("Connected to Redis successfully"));
redis.on("error", (err) => logger.error({ err }, "Redis connection error"));

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

export default redis;
