import Redis from "ioredis";
import { config } from "../configs/env";
import { randomBytes } from "crypto";

/**
 * Shared Local Redis client instance (TCP).
 * Points to your Docker Redis container.
 */
const url = config.redisUrl;
if (!url) {
    throw new Error("Redis URL not found");
}
export const redis = new Redis(url);

/**
 * Distributed Lock (Redlock-lite)
 * Uses SET NX PX for atomic acquisition.
 */
export async function acquireLock(key: string, ttlMs: number): Promise<string | null> {
  const lockId = randomBytes(16).toString("hex");
  const result = await redis.set(`lock:${key}`, lockId, "PX", ttlMs, "NX");
  return result === "OK" ? lockId : null;
}

export async function releaseLock(key: string, lockId: string): Promise<boolean> {
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  const result = await redis.eval(script, 1, `lock:${key}`, lockId);
  return result === 1;
}

export default redis;
