import { type ICradle } from "../../libs/awilix-container";
import redis from "../../libs/core/redis";
import { AppError } from "../../utils/app-error";

export interface CacheKeyItem {
  key: string;
}

export interface CacheKeyDetails {
  key: string;
  type: string;
  ttl: number;
  value: any;
}

export interface ICacheAdminService {
  getCacheKeys(cursor: string, pattern: string, count: number): Promise<{ nextCursor: string; keys: string[] }>;
  getKeyDetails(key: string): Promise<CacheKeyDetails>;
  deleteKey(key: string): Promise<void>;
  flushCache(): Promise<void>;
}

export class CacheAdminService implements ICacheAdminService {
  constructor(cradle: ICradle) {
    // We can inject redis via cradle if it was registered, 
    // but the platform exports it directly from libs/core/redis.
  }

  async getCacheKeys(cursor: string = "0", pattern: string = "*", count: number = 100): Promise<{ nextCursor: string; keys: string[] }> {
    try {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", count);
      return {
        nextCursor,
        keys,
      };
    } catch (error) {
      throw AppError.internal("Failed to scan cache keys");
    }
  }

  async getKeyDetails(key: string): Promise<CacheKeyDetails> {
    try {
      const type = await redis.type(key);
      if (type === "none") {
        throw AppError.notFound(`Cache key '${key}' not found`);
      }

      const ttl = await redis.ttl(key);
      let value: any = null;

      switch (type) {
        case "string":
          const strVal = await redis.get(key);
          try {
            value = strVal ? JSON.parse(strVal) : null;
          } catch {
            value = strVal; // not JSON
          }
          break;
        case "hash":
          value = await redis.hgetall(key);
          break;
        case "list":
          value = await redis.lrange(key, 0, -1);
          break;
        case "set":
          value = await redis.smembers(key);
          break;
        case "zset":
          value = await redis.zrange(key, 0, -1, "WITHSCORES");
          break;
        case "stream":
          // Fetch the first 100 events from the stream to avoid massive payload
          value = await redis.xrange(key, "-", "+", "COUNT", 100);
          break;
        default:
          value = `Unsupported data type: ${type}`;
      }

      return {
        key,
        type,
        ttl,
        value,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal(`Failed to get details for cache key: ${key}`);
    }
  }

  async deleteKey(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      throw AppError.internal(`Failed to delete cache key: ${key}`);
    }
  }

  async flushCache(): Promise<void> {
    try {
      await redis.flushdb();
    } catch (error) {
      throw AppError.internal("Failed to flush cache");
    }
  }
}
