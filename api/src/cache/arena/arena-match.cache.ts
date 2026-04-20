import {
  IArenaMatchService,
  MatchSubmissionData,
} from "../../services/arena/arena-match.service";
import { redis } from "../../libs/core/redis";
import { createLogger } from "../../libs/utils/logger";
import { type ICradle } from "../../libs/awilix-container";
import { ClientSession } from "mongoose";

const logger = createLogger("arena-match-cache");

/**
 * UserStatsCache Decorator.
 * Implements high-performance caching for Arena Match history and details.
 * Optimized for heavy aggregation queries and immutable historical data.
 */
export class ArenaMatchCache implements IArenaMatchService {
  private readonly rawService: IArenaMatchService;


  // Cache configuration
  private readonly CACHE_CONFIG = {
    HISTORY: {
      TTL: 300, // 5 minutes (volatile match list)
      GetKey: (userId: string, limit: number) =>
        `arena:match:history:${userId}:${limit}`,
    },
    DETAIL: {
      TTL: 86400, // 24 hours (immutable historical data)
      GetKey: (matchId: string) => `arena:match:detail:${matchId}`,
    },
  };

  constructor({ rawArenaMatchService }: ICradle) {
    this.rawService = rawArenaMatchService;
  }

  /**
   * Proxies match history with a short-term Cache-Aside strategy.
   */
  async getMatchHistory(userId: string, limit: number = 10): Promise<any[]> {
    const key = this.CACHE_CONFIG.HISTORY.GetKey(userId, limit);

    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ userId, limit }, "🚀 CACHE HIT (Arena Match History)");
        return JSON.parse(cached);
      }

      logger.info({ userId, limit }, "📉 CACHE MISS (Arena Match History)");
      const history = await this.rawService.getMatchHistory(userId, limit);

      // We only cache if history exists
      if (history && history.length > 0) {
        await redis.set(
          key,
          JSON.stringify(history),
          "EX",
          this.CACHE_CONFIG.HISTORY.TTL,
        );
      }


      return history;
    } catch (err) {
      logger.error({ err, userId }, "Cache error in getMatchHistory");
      return this.rawService.getMatchHistory(userId, limit);
    }
  }

  /**
   * Proxies match details with a long-term Cache-Aside strategy.
   * COMPLETED matches are essentially canonical and never change.
   */
  async getMatchDetail(matchId: string): Promise<any | null> {
    const key = this.CACHE_CONFIG.DETAIL.GetKey(matchId);

    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ matchId }, "🚀 CACHE HIT (Arena Match Detail)");
        return JSON.parse(cached);
      }

      logger.info({ matchId }, "📉 CACHE MISS (Arena Match Detail)");
      const detail = await this.rawService.getMatchDetail(matchId);

      // CRITICAL: We only cache COMPLETED matches since they are immutable.
      // Temporary/Ongoing matches should not be cached in this layer.
      if (detail && detail.status === "COMPLETED") {
        await redis.set(
          key,
          JSON.stringify(detail),
          "EX",
          this.CACHE_CONFIG.DETAIL.TTL,
        );
      }


      return detail;
    } catch (err) {
      logger.error({ err, matchId }, "Cache error in getMatchDetail");
      return this.rawService.getMatchDetail(matchId);
    }
  }

  // --- PASS-THROUGH METHODS (Lifecycle methods don't need caching) ---

  async handleMatchSubmission(data: MatchSubmissionData): Promise<any> {
    return this.rawService.handleMatchSubmission(data);
  }

  async finalizeMatch(
    roomId: string,
    match: any,
    traceId?: string,
    session?: ClientSession,
  ): Promise<void> {
    // Note: When a match is finalized, we COULD invalidate the history cache for all participants,
    // but with a 5-minute TTL, it's often simpler to let it expire naturally.
    return this.rawService.finalizeMatch(roomId, match, traceId, session);
  }

  async forceFinishMatch(roomId: string): Promise<void> {
    return this.rawService.forceFinishMatch(roomId);
  }
}
