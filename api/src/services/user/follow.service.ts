import { type IFollowRepository } from "../../repositories/user/follow.repository";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { AppError } from "../../utils/app-error";

import { type IStatsService } from "../stats/stats.service";

const logger = createLogger("follow-service");


export interface IFollowService {
  followUser(followerClerkId: string, followingUsername: string): Promise<void>;
  unfollowUser(
    followerClerkId: string,
    targetUsername: string,
  ): Promise<boolean>;
  getFollowers(username: string): Promise<any[]>;
  getFollowing(username: string): Promise<any[]>;
  getFollowStatus(
    currentClerkId: string | undefined,
    targetUsername: string,
  ): Promise<any>;
}

export class FollowService implements IFollowService {
  private readonly followRepository: IFollowRepository;
  private readonly userRepository: IUserRepository;
  private readonly statsService: IStatsService;

  constructor({ followRepository, userRepository, statsService }: ICradle) {
    this.followRepository = followRepository;
    this.userRepository = userRepository;
    this.statsService = statsService;
  }


  async followUser(
    followerClerkId: string,
    followingUsername: string,
  ): Promise<void> {
    const follower = await this.userRepository.findByClerkId(followerClerkId);
    const following =
      await this.userRepository.findByUsername(followingUsername);

    if (!follower || !following) {
      logger.warn(
        { followerClerkId, followingUsername },
        "User not found during follow attempt",
      );
      throw AppError.notFound("One or more users not found");
    }

    if (follower.id === following.id) {
      logger.warn(
        { userId: follower.id },
        "User attempted to follow themselves",
      );
      throw AppError.badRequest("You cannot follow yourself");
    }

    await this.followRepository.follow(follower.id, following.id);

    // Invalidate caches for both sides
    await Promise.all([
      this.statsService.invalidateProfile(follower.id),
      this.statsService.invalidateProfile(following.id),
    ]);

    logger.info(
      { followerId: follower.id, followingId: following.id },
      "User followed successfully",
    );

  }

  async unfollowUser(
    followerClerkId: string,
    targetUsername: string,
  ): Promise<boolean> {
    const follower = await this.userRepository.findByClerkId(followerClerkId);
    const target = await this.userRepository.findByUsername(targetUsername);

    if (!follower || !target) {
      throw AppError.notFound("One or more users not found");
    }

    const deleted = await this.followRepository.unfollow(
      follower.id,
      target.id,
    );
    if (!deleted) {
      throw AppError.badRequest("You were not following this user");
    }

    // Invalidate caches for both sides
    await Promise.all([
      this.statsService.invalidateProfile(follower.id),
      this.statsService.invalidateProfile(target.id),
    ]);

    return true;

  }

  async getFollowers(username: string): Promise<any[]> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return await this.followRepository.getFollowersList(user.id);
  }

  async getFollowing(username: string): Promise<any[]> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return await this.followRepository.getFollowingList(user.id);
  }

  async getFollowStatus(
    currentClerkId: string | undefined,
    targetUsername: string,
  ) {
    const targetUser = await this.userRepository.findByUsername(targetUsername);
    if (!targetUser) {
      throw AppError.notFound("Target warrior not found");
    }

    const counts = await this.followRepository.getFollowCounts(targetUser.id);
    let isFollowing = false;

    if (currentClerkId) {
      const currentUser =
        await this.userRepository.findByClerkId(currentClerkId);
      if (currentUser) {
        isFollowing = await this.followRepository.isFollowing(
          currentUser.id,
          targetUser.id,
        );
      }
    }

    return {
      ...counts,
      isFollowing,
    };
  }
}
