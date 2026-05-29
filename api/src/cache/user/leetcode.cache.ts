import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import { type ILeetCodeService, type LeetCodeStats } from "../../services/stats/leetcode.service";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("leetcode-cache");

/**
 * LeetCodeCache Decorator.
 * Shields the external LeetCode API by providing an independent caching layer.
 * This cache is NOT invalidated by Arena activity, ensuring stable performance.
 */
export class LeetCodeCache implements ILeetCodeService {
  private readonly CACHE_TTL = 7200; // 2 hours
  private readonly rawLeetCodeService: ILeetCodeService;

  constructor({ rawLeetCodeService }: ICradle) {
    this.rawLeetCodeService = rawLeetCodeService;
  }

  private getCacheKey(username: string): string {
    return `external:leetcode:stats:${username.toLowerCase()}`;
  }

  async getUserStats(username: string): Promise<LeetCodeStats | null> {
    const cacheKey = this.getCacheKey(username);

    // 1. Independent Cache Lookup
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ username }, "🛡️ SHIELD CACHE HIT: Served LeetCode stats from Redis");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ username, err }, "Redis GET error in LeetCode cache");
    }

    // 2. API Fallback
    logger.warn({ username }, "📡 SHIELD CACHE MISS: Fetching from LeetCode API...");
    const stats = await this.rawLeetCodeService.getUserStats(username);

    if (stats) {
      try {
        await redis.set(cacheKey, JSON.stringify(stats), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ username, err }, "Redis SET error in LeetCode cache");
      }
    }

    return stats;
  }
}
