import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import { type IStatsService } from "../../services/stats/stats.service";
import { type ICradle } from "../../libs/awilix-container";
import { type IUserRepository } from "../../repositories/user/user.repository";
<<<<<<< HEAD
=======
import { type LeaderboardCache } from "../stats/leaderboard.cache";
>>>>>>> prod-deploy

const logger = createLogger("user-stats-cache");

/**
 * UserStatsCache Decorator.
 * Implements IStatsService to provide a high-performance caching layer for user profiles.
 */
export class UserStatsCache implements IStatsService {
<<<<<<< HEAD
  private readonly CACHE_TTL = 86400; // 24 hours
  private readonly rawStatsService: IStatsService;
  private readonly userRepository: IUserRepository;

  constructor({ rawStatsService, userRepository }: ICradle) {
    this.rawStatsService = rawStatsService;
    this.userRepository = userRepository;
=======
  private readonly CACHE_TTL = 14400; // 4 hours
  private readonly rawStatsService: IStatsService;
  private readonly userRepository: IUserRepository;
  private readonly leaderboardCache: LeaderboardCache;

  constructor({ rawStatsService, userRepository, leaderboardCache }: ICradle) {
    this.rawStatsService = rawStatsService;
    this.userRepository = userRepository;
    this.leaderboardCache = leaderboardCache;
>>>>>>> prod-deploy
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
      logger.info({ userId }, "♻️ CACHE INVALIDATED: Profile stats cleared from Redis");
    } catch (err) {
      logger.error({ userId, err }, "Failed to invalidate user stats cache");
    }
  }

  async getProfileStats(identifier: string, viewerClerkId?: string): Promise<any> {
<<<<<<< HEAD
    // 1. Resolve Identity to ensure a stable cache key (UUID-based key)
=======
>>>>>>> prod-deploy
    let user = await this.userRepository.findByUsername(identifier);
    if (!user) {
      user = await this.userRepository.findByClerkId(identifier);
    }

    if (!user) {
      logger.warn({ identifier }, "User identity resolution failed during stats caching");
      return null;
    }

    const cacheKey = this.getCacheKey(user.id);

<<<<<<< HEAD
    // 2. Cache Lookup
=======
>>>>>>> prod-deploy
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ userId: user.id, identifier }, "🚀 CACHE HIT: Served profile stats from Redis");
<<<<<<< HEAD
        return JSON.parse(cached);
=======
        const data = JSON.parse(cached);
        
        // LIVE RANK INJECTION: Even if stats are cached, fetch a fresh rank from the ZSET
        const freshRank = await this.leaderboardCache.getUserRank(user.id);
        if (data.stats) {
          data.stats.rank = freshRank?.rank || null;
        }
        
        return data;
>>>>>>> prod-deploy
      }
    } catch (err) {
      logger.error({ userId: user.id, err }, "Redis GET error in user stats cache");
    }

<<<<<<< HEAD
    // 3. DB Fallback & Cache Population
    logger.warn({ userId: user.id, identifier }, "📉 CACHE MISS: Fetching fresh stats from database...");
    
    // We pass the identifier to the raw service. 
    // Since we already resolved the user, we could potentially optimize the raw service 
    // to accept a UUID, but to stay strictly as a decorator, we call it normally.
=======
    logger.warn({ userId: user.id, identifier }, "📉 CACHE MISS: Fetching fresh stats from database...");

>>>>>>> prod-deploy
    const stats = await this.rawStatsService.getProfileStats(identifier, viewerClerkId);

    if (stats) {
      try {
        await redis.set(cacheKey, JSON.stringify(stats), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ userId: user.id, err }, "Redis SET error in user stats cache");
      }
    }

    return stats;
  }

<<<<<<< HEAD
  async getLeaderboard(limit?: number, offset?: number): Promise<any> {
    // Leaderboard is generally less volatile, but we follow the decorator pattern.
    // We could add caching here too if needed, but the primary target is the Stats Card.
    return this.rawStatsService.getLeaderboard(limit, offset);
=======
  async getLeaderboard(
    limit: number = 50, 
    offset: number = 0,
    viewerId?: string
  ): Promise<{ entries: any[]; total: number; viewerRank?: any }> {
    const cached = await this.leaderboardCache.getRange(limit, offset);
    
    if (cached && cached.length > 0) {
      logger.info({ limit, offset }, "🚀 CACHE HIT: Served leaderboard from Redis ZSET");
      
      const [viewerRank, total] = await Promise.all([
        viewerId ? this.leaderboardCache.getUserRank(viewerId) : Promise.resolve(null),
        this.leaderboardCache.getTotalCount()
      ]);

      return { entries: cached, total, viewerRank };
    }

    logger.warn({ limit, offset }, "📉 CACHE MISS: Leaderboard not found in Redis, falling back to DB");
    const dbUsers = await this.rawStatsService.getLeaderboard(limit, offset, viewerId);
    
    // Normalize DB data to match LeaderboardEntry format
    const entries = (dbUsers.entries || []).map((user: any, index: number) => ({
      userId: user.userId,
      username: user.username || "User",
      fullName: user.fullName || null,
      avatarUrl: user.avatarUrl || null,
      points: user.totalPoints || user.points || 0,
      totalSolved: user.totalSolved || 0,
      rank: offset + index + 1
    }));

    return { entries, total: dbUsers.total, viewerRank: dbUsers.viewerRank };
  }

  async searchLeaderboard(query: string, limit?: number): Promise<{ entries: any[] }> {
    return this.rawStatsService.searchLeaderboard(query, limit);
  }

  async syncLeaderboard(): Promise<{ total: number }> {
    return this.rawStatsService.syncLeaderboard();
>>>>>>> prod-deploy
  }
}
