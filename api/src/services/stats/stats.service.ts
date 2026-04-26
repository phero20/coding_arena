import { type IStatsRepository } from "../../repositories/stats/stats.repository";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type IFollowRepository } from "../../repositories/user/follow.repository";
import { type ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";

import { type ILeetCodeService } from "./leetcode.service";

const logger = createLogger("stats-service");

export interface IStatsService {
  getProfileStats(identifier: string, viewerClerkId?: string): Promise<any>;
  getLeaderboard(limit?: number, offset?: number): Promise<any>;
  invalidateProfile(userId: string): Promise<void>;
}

export class StatsService implements IStatsService {
  private readonly statsRepository: IStatsRepository;
  private readonly userRepository: IUserRepository;
  private readonly followRepository: IFollowRepository;
  private readonly leetcodeService: ILeetCodeService;

  constructor({
    statsRepository,
    userRepository,
    followRepository,
    leetcodeService,
  }: ICradle) {
    this.statsRepository = statsRepository;
    this.userRepository = userRepository;
    this.followRepository = followRepository;
    this.leetcodeService = leetcodeService;
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
    const [stats, activityLog, followStats, leetcodeStats] = await Promise.all([
      this.statsRepository.getUserStats(user.id),
      this.statsRepository.getUserActivityLog(user.id),
      this.getFollowContext(user.id, viewerClerkId),
      user.leetcodeUsername
        ? this.leetcodeService.getUserStats(user.leetcodeUsername)
        : Promise.resolve(null),
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
      stats: stats || {
        totalPoints: 0,
        arenaPoints: 0,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        arenaGames: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
      activityLog: activityLog || [],
      social: followStats,
      leetcode: leetcodeStats,
    };
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
   * Retrieves the global leaderboard.
   */
  async getLeaderboard(limit: number = 50, offset: number = 0) {
    logger.info({ limit, offset }, "Fetching global leaderboard...");
    return await this.statsRepository.getTopUsers(limit, offset);
  }
}
