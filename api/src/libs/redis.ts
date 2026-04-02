import Redis from "ioredis";
import { config } from "../configs/env";

/**
 * Shared Local Redis client instance (TCP).
 * Points to your Docker Redis container.
 */
const url = config.redisUrl;
if (!url) {
    throw new Error("Redis URL not found");
}
export const redis = new Redis(url);

export default redis;
