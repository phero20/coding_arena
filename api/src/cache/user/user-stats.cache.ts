import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import { type IStatsService } from "../../services/stats/stats.service";
import { type ICradle } from "../../libs/awilix-container";
import { type IUserRepository } from "../../repositories/user/user.repository";

const logger = createLogger("user-stats-cache");

/**
 * UserStatsCache Decorator.
 * Implements IStatsService to provide a high-performance caching layer for user profiles.
 */
export class UserStatsCache implements IStatsService {
  private readonly CACHE_TTL = 14400; // 4 hours
  private readonly rawStatsService: IStatsService;
  private readonly userRepository: IUserRepository;

  constructor({ rawStatsService, userRepository }: ICradle) {
    this.rawStatsService = rawStatsService;
    this.userRepository = userRepository;
  }

  /**
   * Helper to generate a consistent cache key using the internal UUID.
   */
  private getCacheKey(userId: string): string {
    return `user:profile:stats:${userId}`;
  }

  /**
   * Invalidates the profile stats cache for a specific user.
   */
  async invalidateProfile(userId: string): Promise<void> {
    const key = this.getCacheKey(userId);
    try {
      await redis.del(key);
      logger.info(
        { userId },
        "♻️ CACHE INVALIDATED: Profile stats cleared from Redis",
      );
    } catch (err) {
      logger.error({ userId, err }, "Failed to invalidate user stats cache");
    }
  }

  async getProfileStats(
    identifier: string,
    viewerClerkId?: string,
  ): Promise<any> {
    // 1. Resolve Identity to ensure a stable cache key (UUID-based key)
    let user = await this.userRepository.findByUsername(identifier);
    if (!user) {
      user = await this.userRepository.findByClerkId(identifier);
    }

    if (!user) {
      logger.warn(
        { identifier },
        "User identity resolution failed during stats caching",
      );
      return null;
    }

    const cacheKey = this.getCacheKey(user.id);

    // 2. Cache Lookup
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(
          { userId: user.id, identifier },
          "🚀 CACHE HIT: Served profile stats from Redis",
        );
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error(
        { userId: user.id, err },
        "Redis GET error in user stats cache",
      );
    }

    // 3. DB Fallback & Cache Population
    logger.warn(
      { userId: user.id, identifier },
      "📉 CACHE MISS: Fetching fresh stats from database...",
    );

    // We pass the identifier to the raw service.
    // Since we already resolved the user, we could potentially optimize the raw service
    // to accept a UUID, but to stay strictly as a decorator, we call it normally.
    const stats = await this.rawStatsService.getProfileStats(
      identifier,
      viewerClerkId,
    );

    if (stats) {
      try {
        await redis.set(cacheKey, JSON.stringify(stats), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error(
          { userId: user.id, err },
          "Redis SET error in user stats cache",
        );
      }
    }

    return stats;
  }

  async getLeaderboard(limit?: number, offset?: number): Promise<any> {
    // Leaderboard is generally less volatile, but we follow the decorator pattern.
    // We could add caching here too if needed, but the primary target is the Stats Card.
    return this.rawStatsService.getLeaderboard(limit, offset);
  }
}
