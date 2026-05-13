import { redis } from "../../libs/core/redis";
import { createLogger } from "../../libs/utils/logger";
import { type ICradle } from "../../libs/awilix-container";
import { type User } from "../../db/schema";

const logger = createLogger("leaderboard-cache");

export interface LeaderboardEntry {
  userId: string;
  username: string;
  fullName?: string | null;
  avatarUrl: string | null;
  points: number;
  rank: number;
  totalSolved: number;
}

/**
 * LeaderboardCache
 * Uses Redis ZSET (Sorted Set) for O(log N) ranking and HASHes for user metadata.
 */
export class LeaderboardCache {
  private readonly ZSET_KEY = "leaderboard:global";
  private readonly META_PREFIX = "user:meta:";

  constructor(_cradle: ICradle) {}

  /**
   * Updates a user's score in the leaderboard.
   * If the user doesn't exist in the ZSET, they are added.
   */
  async updateScore(userId: string, points: number): Promise<void> {
    try {
      await redis.zadd(this.ZSET_KEY, points, userId);
    } catch (err) {
      logger.error({ userId, points, err }, "Failed to update leaderboard score");
    }
  }

  /**
   * Updates user metadata (username, avatar) for leaderboard display.
   */
  async updateUserMetadata(user: Partial<User> & { id: string; totalSolved?: number }): Promise<void> {
    const key = `${this.META_PREFIX}${user.id}`;
    const data: Record<string, string> = {};
    
    if (user.username) data.username = user.username;
    if (user.avatarUrl) data.avatarUrl = user.avatarUrl;
    if (user.fullName) data.fullName = user.fullName;
    if (user.totalSolved !== undefined) data.totalSolved = user.totalSolved.toString();

    if (Object.keys(data).length === 0) return;

    try {
      await redis.hset(key, data);
      await redis.expire(key, 86400 * 7); // 1 week TTL for metadata
    } catch (err) {
      logger.error({ userId: user.id, err }, "Failed to update user metadata in Redis");
    }
  }

  /**
   * Retrieves a range of users from the leaderboard.
   */
  async getRange(limit: number = 50, offset: number = 0): Promise<LeaderboardEntry[]> {
    try {
      // 1. Get Top IDs and Scores from ZSET
      // ZREVRANGE is used for descending order (highest points first)
      const raw = await redis.zrevrange(this.ZSET_KEY, offset, offset + limit - 1, "WITHSCORES");
      
      if (!raw || raw.length === 0) return [];

      const entries: LeaderboardEntry[] = [];
      
      // 2. Process pairs of [ID, Score]
      for (let i = 0; i < raw.length; i += 2) {
        const userId = raw[i];
        const points = parseInt(raw[i + 1], 10);
        const rank = offset + (i / 2) + 1;

        // 3. Fetch Metadata from HASH
        const meta = await redis.hgetall(`${this.META_PREFIX}${userId}`);

        entries.push({
          userId,
          points,
          rank,
          username: meta.username || "Unknown",
          fullName: meta.fullName || null,
          avatarUrl: meta.avatarUrl || null,
          totalSolved: parseInt(meta.totalSolved || "0", 10),
        });
      }

      return entries;
    } catch (err) {
      logger.error({ limit, offset, err }, "Failed to fetch leaderboard range from Redis");
      return [];
    }
  }

  /**
   * Gets a specific user's rank and score.
   */
  async getUserRank(userId: string): Promise<LeaderboardEntry | null> {
    try {
      const [rank, score, meta] = await Promise.all([
        redis.zrevrank(this.ZSET_KEY, userId),
        redis.zscore(this.ZSET_KEY, userId),
        redis.hgetall(`${this.META_PREFIX}${userId}`),
      ]);

      if (rank === null || score === null) return null;

      return {
        userId,
        rank: rank + 1,
        points: parseInt(score, 10),
        username: meta.username || "Unknown",
        fullName: meta.fullName || null,
        avatarUrl: meta.avatarUrl || null,
        totalSolved: parseInt(meta.totalSolved || "0", 10),
      };
    } catch (err) {
      logger.error({ userId, err }, "Failed to fetch user rank from Redis");
      return null;
    }
  }

  async getTotalCount(): Promise<number> {
    return await redis.zcard(this.ZSET_KEY);
  }

  /**
   * Completely resets the leaderboard (use for sync).
   */
  async clear(): Promise<void> {
    await redis.del(this.ZSET_KEY);
  }
}
