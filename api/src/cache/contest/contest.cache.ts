import { redis } from "../../libs/core/redis";
import { createLogger } from "../../libs/utils/logger";
import { type Contest } from "../../db/schema";

const logger = createLogger("contest-cache");

/**
 * ContestCache manages high-performance access to upcoming contests via Redis.
 * It uses a Sorted Set (ZSET) for timelines and expiring keys for contest details.
 */
export class ContestCache {
  private readonly TIMELINE_KEY = "contests:timeline";
  private readonly CONTEST_PREFIX = "contest:ext:";

  /**
   * Updates the upcoming contests in Redis.
   * Performs timeline pruning and sets individual keys with TTL based on contest end time.
   */
  async setUpcomingContests(contests: Contest[]): Promise<void> {
    const pipeline = redis.multi();
    const now = Math.floor(Date.now() / 1000);

    // 1. Prune old entries from the timeline sorted set
    pipeline.zremrangebyscore(this.TIMELINE_KEY, "-inf", now.toString());

    for (const contest of contests) {
      const startTime = Math.floor(new Date(contest.startTime).getTime() / 1000);
      const endTime = Math.floor(new Date(contest.endTime).getTime() / 1000);
      const ttl = endTime - now;

      // Only cache contests that haven't ended yet
      if (ttl > 0) {
        // 2. Store individual contest details with an expiry (TTL)
        // This ensures the contest self-deletes from Redis once it's over
        pipeline.setex(
          `${this.CONTEST_PREFIX}${contest.clistId}`,
          ttl,
          JSON.stringify(contest)
        );

        // 3. Update the timeline index
        pipeline.zadd(this.TIMELINE_KEY, startTime, contest.clistId.toString());
      }
    }

    try {
      await pipeline.exec();
      logger.info({ count: contests.length }, "Synchronized upcoming contests with Redis");
    } catch (err) {
      logger.error({ err }, "Failed to update contest cache in Redis");
    }
  }

  /**
   * Retrieves upcoming contests from the Redis sorted set.
   * Results are always sorted by start time.
   */
  async getUpcomingContests(limit: number = 20): Promise<Contest[]> {
    const now = Math.floor(Date.now() / 1000);
    
    // Fetch IDs of contests starting from 'now' onwards
    const ids = await redis.zrangebyscore(
      this.TIMELINE_KEY, 
      now.toString(), 
      "+inf", 
      "LIMIT", 
      0, 
      limit
    );
    
    if (ids.length === 0) return [];

    const keys = ids.map(id => `${this.CONTEST_PREFIX}${id}`);
    const results = await redis.mget(...keys);

    return results
      .filter((r): r is string => !!r)
      .map(r => JSON.parse(r) as Contest);
  }

  /**
   * Clears the contest cache completely.
   */
  async clear(): Promise<void> {
    const keys = await redis.keys(`${this.CONTEST_PREFIX}*`);
    if (keys.length > 0) await redis.del(...keys);
    await redis.del(this.TIMELINE_KEY);
    logger.warn("Contest cache cleared");
  }
}
