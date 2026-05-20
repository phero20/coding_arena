import { type IStatsRepository } from "../../repositories/stats/stats.repository";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type IFollowRepository } from "../../repositories/user/follow.repository";
import { type ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("stats-service");

export interface IStatsService {
  getProfileStats(identifier: string, viewerClerkId?: string): Promise<any>;
  getLeaderboard(limit?: number, offset?: number): Promise<any>;
}

export class StatsService implements IStatsService {
  private readonly statsRepository: IStatsRepository;
  private readonly userRepository: IUserRepository;
  private readonly followRepository: IFollowRepository;

  constructor({ statsRepository, userRepository, followRepository }: ICradle) {
    this.statsRepository = statsRepository;
    this.userRepository = userRepository;
    this.followRepository = followRepository;
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
    const [stats, activityLog, followStats] = await Promise.all([
      this.statsRepository.getUserStats(user.id),
      this.statsRepository.getUserActivityLog(user.id),
      this.getFollowContext(user.id, viewerClerkId),
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
