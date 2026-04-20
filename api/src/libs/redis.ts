import Redis from "ioredis";
import { config } from "../configs/env";
import { randomBytes } from "crypto";
import { createLogger } from "./logger";

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
 * Distributed Lock (Redlock-lite)
 * Uses SET NX PX for atomic acquisition.
 * Supports optional retries for high-concurrency scenarios.
 */
export async function acquireLock(
  key: string, 
  ttlMs: number, 
  retryCount = 0, 
  retryDelay = 50
): Promise<string | null> {
  const lockId = randomBytes(16).toString("hex");
  let attempts = 0;

  while (attempts <= retryCount) {
    try {
      const result = await redis.set(`lock:${key}`, lockId, "PX", ttlMs, "NX");
      if (result === "OK") {
        logger.debug({ key, ttlMs, lockId, attempts }, "Distributed lock acquired");
        return lockId;
      }
    } catch (err) {
      logger.error({ key, err }, "Failed to acquire distributed lock");
      return null;
    }

    if (attempts < retryCount) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
    attempts++;
  }

  return null;
}

export async function releaseLock(key: string, lockId: string): Promise<boolean> {
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  try {
    const result = await redis.eval(script, 1, `lock:${key}`, lockId);
    const released = result === 1;
    if (released) {
      logger.debug({ key, lockId }, "Distributed lock released");
    } else {
      logger.warn({ key, lockId }, "Failed to release distributed lock (possibly expired or invalid ID)");
    }
    return released;
  } catch (err) {
    logger.error({ key, lockId, err }, "Error releasing distributed lock");
    return false;
  }
}

export default redis;
