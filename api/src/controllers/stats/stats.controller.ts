import { BaseController } from "../base.controller";
import { type IStatsService } from "../../services/stats/stats.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("stats-controller");

export class StatsController extends BaseController {
  private readonly statsService: IStatsService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.statsService = cradle.statsService;
  }

  /**
   * GET /profile/:username
   * Retrieves full profile analytics for a user.
   */
  async getProfileStats(req: ControllerRequest<never, { username: string }>) {
    const { username } = req.params;
    const viewerClerkId = req.clerkUserId;
    
    const stats = await this.statsService.getProfileStats(username, viewerClerkId);
    
    if (!stats) {
      throw AppError.notFound("User analytics not found");
    }

    return stats;
  }

  /**
   * GET /leaderboard
   * Retrieves the global leaderboard.
   */
  async getLeaderboard(req: ControllerRequest<never, any, { limit?: string; offset?: string }>) {
    const limit = parseInt(req.query.limit || "50", 10);
    const offset = parseInt(req.query.offset || "0", 10);

    return await this.statsService.getLeaderboard(limit, offset);
  }
}
