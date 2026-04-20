import { BaseController } from "../base.controller";
import { type IFollowService } from "../../services/user/follow.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";

export class FollowController extends BaseController {
  private readonly followService: IFollowService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.followService = cradle.followService;
  }

  /**
   * POST /follows/:username
   * Authenticated user follows another user.
   */
  async follow(req: ControllerRequest<never, { username: string }>) {
    const { username } = req.params;
    const followerClerkId = req.clerkUserId;

    if (!followerClerkId) {
      throw Error("Unauthorized: Identity context missing");
    }

    await this.followService.followUser(followerClerkId, username);

    return { message: "Followed successfully" };
  }

  /**
   * DELETE /follows/:username
   * Authenticated user unfollows another user.
   */
  async unfollow(req: ControllerRequest<never, { username: string }>) {
    const { username } = req.params;
    const followerClerkId = req.clerkUserId;

    if (!followerClerkId) {
      throw Error("Unauthorized: Identity context missing");
    }

    await this.followService.unfollowUser(followerClerkId, username);

    return { message: "Unfollowed successfully" };
  }

  /**
   * GET /follows/:username/followers
   * Publicly retrieve the list of followers for a user.
   */
  async getFollowers(req: ControllerRequest<never, { username: string }>) {
    const { username } = req.params;
    const followers = await this.followService.getFollowers(username);
    return followers;
  }

  /**
   * GET /follows/:username/following
   * Publicly retrieve the list of users followed by a user.
   */
  async getFollowing(req: ControllerRequest<never, { username: string }>) {
    const { username } = req.params;
    const following = await this.followService.getFollowing(username);
    return following;
  }
}
