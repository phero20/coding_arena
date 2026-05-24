import { type IStatsRepository } from "../../repositories/stats/stats.repository";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type IFollowRepository } from "../../repositories/user/follow.repository";
import { type ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";

import { type ILeetCodeService } from "./leetcode.service";

const logger = createLogger("stats-service");

export interface IStatsService {
  getProfileStats(identifier: string, viewerClerkId?: string): Promise<any>;
  getLeaderboard(limit?: number, offset?: number, viewerId?: string): Promise<{ 
    entries: any[]; 
    total: number;
    viewerRank?: any;
  }>;
  invalidateProfile(userId: string): Promise<void>;
  searchLeaderboard(query: string, limit?: number): Promise<{ entries: any[] }>;
  syncLeaderboard(): Promise<{ total: number }>;
}

export class StatsService implements IStatsService {
  private readonly statsRepository: IStatsRepository;
  private readonly userRepository: IUserRepository;
  private readonly followRepository: IFollowRepository;
  private readonly leetcodeService: ILeetCodeService;
  private readonly leaderboardCache: import("../../cache/stats/leaderboard.cache").LeaderboardCache;

  constructor({
    statsRepository,
    userRepository,
    followRepository,
    leetcodeService,
    leaderboardCache,
  }: ICradle) {
    this.statsRepository = statsRepository;
    this.userRepository = userRepository;
    this.followRepository = followRepository;
    this.leetcodeService = leetcodeService;
    this.leaderboardCache = leaderboardCache;
  }

  /**
   * Performs a full synchronization of all PostgreSQL users into the Redis ZSET.
   * Includes users with 0 points/solves.
   */
  async syncLeaderboard(): Promise<{ total: number }> {
    logger.info("Starting inclusive leaderboard synchronization...");
    
    // 1. Clear existing cache
    await this.leaderboardCache.clear();

    // 2. Fetch all users from Postgres
    const users = await this.userRepository.findAll();
    
    // 3. Process users and their stats
    let count = 0;
    const usersData = [];
    
    // Note: We fetch stats sequentially here to avoid overwhelming Postgres,
    // but we will pipeline ALL Redis writes at the end.
    for (const user of users) {
      const stats = await this.statsRepository.getUserStats(user.id);
      usersData.push({ user, stats });
      count++;
    }

    // 4. Batch write everything to Redis in a single pipeline
    if (usersData.length > 0) {
      await this.leaderboardCache.syncLeaderboardBatch(usersData);
    }

    logger.info({ total: count }, "Inclusive leaderboard sync completed ✅");
    return { total: count };
  }

  /**
   * No-op implementation.
   * The actual invalidation is handled by the caching decorator.
   */
  async invalidateProfile(userId: string): Promise<void> {
    return;
  }

  /**
   * Retrieves full profile analytics for a user by their identifier (username or clerkId).
   */
  async getProfileStats(identifier: string, viewerClerkId?: string) {
    logger.info({ identifier }, "Fetching profile stats...");

    // 1. Resolve Identity (Try Username first, then Clerk ID)
    let user = await this.userRepository.findByUsername(identifier);

    if (!user) {
      logger.info(
        { identifier },
        "User not found by username, trying Clerk ID lookup...",
      );
      user = await this.userRepository.findByClerkId(identifier);
    }

    if (!user) {
      logger.warn({ identifier }, "User not found for stats retrieval");
      return null;
    }

    // 2. Fetch parallel data for efficiency
    const [stats, activityLog, followStats, leetcodeStats, rankData] = await Promise.all([
      this.statsRepository.getUserStats(user.id),
      this.statsRepository.getUserActivityLog(user.id),
      this.getFollowContext(user.id, viewerClerkId),
      user.leetcodeUsername
        ? this.leetcodeService.getUserStats(user.leetcodeUsername)
        : Promise.resolve(null),
      this.leaderboardCache.getUserRank(user.id),
    ]);

    return {
      user: {
        id: user.id,
        clerkId: user.clerkId,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        linkedinUsername: user.linkedinUsername,
        leetcodeUsername: user.leetcodeUsername,
        joinedAt: user.createdAt,
      },
      stats: {
        ...(stats || {
          totalPoints: 0,
          arenaPoints: 0,
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          arenaGames: 0,
          currentStreak: 0,
          bestStreak: 0,
        }),
        rank: rankData?.rank || null,
      },
      activityLog: activityLog || [],
      social: followStats,
      leetcode: leetcodeStats,
    };
  }

  async searchLeaderboard(query: string, limit: number = 20): Promise<{ entries: any[] }> {
    // 1. Database Fuzzy Search (Find the "Who")
    const users = await this.userRepository.search(query, limit);
    
    if (users.length === 0) {
      return { entries: [] };
    }

    // 2. Redis Enrichment (Find the "What" - Ranks, Points, Meta)
    const enrichedEntries = await Promise.all(
      users.map(async (user) => {
        const entry = await this.leaderboardCache.getUserRank(user.id);
        
        // If user is in Redis, we use that data. 
        // If not (highly unlikely if synced), we return 0-rank entry.
        return entry || {
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          points: 0,
          rank: 0,
          totalSolved: 0
        };
      })
    );

    // Sort by rank ascending (1 is top), 0 rank goes to bottom
    const sortedEntries = enrichedEntries.sort((a, b) => {
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      return a.rank - b.rank;
    });

    return { entries: sortedEntries };
  }

  private async getFollowContext(targetUserId: string, viewerClerkId?: string) {
    const counts = await this.followRepository.getFollowCounts(targetUserId);
    let isFollowing = false;

    if (viewerClerkId) {
      const viewer = await this.userRepository.findByClerkId(viewerClerkId);
      if (viewer) {
        isFollowing = await this.followRepository.isFollowing(
          viewer.id,
          targetUserId,
        );
      }
    }

    return {
      ...counts,
      isFollowing,
    };
  }

  /**
   * Retrieves the global leaderboard with total count for pagination.
   */
  async getLeaderboard(
    limit: number = 50, 
    offset: number = 0, 
    viewerId?: string
  ): Promise<{ entries: any[]; total: number; viewerRank?: any }> {
    const [entries, total] = await Promise.all([
      this.leaderboardCache.getRange(limit, offset),
      this.leaderboardCache.getTotalCount()
    ]);
    
    let viewerRank = null;
    if (viewerId) {
      viewerRank = await this.leaderboardCache.getUserRank(viewerId);
    }

    return { entries, total, viewerRank };
  }
}
