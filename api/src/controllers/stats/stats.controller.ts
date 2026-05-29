import { BaseController } from "../base.controller";
import { type IStatsService } from "../../services/stats/stats.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("stats-controller");

export class StatsController extends BaseController {
  private readonly statsService: IStatsService;
<<<<<<< HEAD
=======
  private readonly userRepository: import("../../repositories/user/user.repository").IUserRepository;
>>>>>>> prod-deploy

  constructor(cradle: ICradle) {
    super(cradle);
    this.statsService = cradle.statsService;
<<<<<<< HEAD
=======
    this.userRepository = cradle.userRepository;
>>>>>>> prod-deploy
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

<<<<<<< HEAD
  /**
   * GET /leaderboard
   * Retrieves the global leaderboard.
   */
  async getLeaderboard(req: ControllerRequest<never, any, { limit?: string; offset?: string }>) {
    const limit = parseInt(req.query.limit || "50", 10);
    const offset = parseInt(req.query.offset || "0", 10);

    return await this.statsService.getLeaderboard(limit, offset);
=======
  async getLeaderboard(req: ControllerRequest<never, any, { limit?: string; offset?: string }>) {
    const limit = parseInt(req.query.limit || "50", 10);
    const offset = parseInt(req.query.offset || "0", 10);
    
    // Resolve viewer identity if authenticated
    let viewerId: string | undefined;
    if (req.clerkUserId) {
      const viewer = await this.userRepository.findByClerkId(req.clerkUserId);
      if (viewer) {
        viewerId = viewer.id;
      }
    }

    return await this.statsService.getLeaderboard(limit, offset, viewerId);
  }

  /**
   * POST /leaderboard/sync
   * Triggers a manual synchronization of the leaderboard from DB to Redis.
   */
  async syncLeaderboard() {
    logger.info("Manual leaderboard sync triggered via API");
    const result = await this.statsService.syncLeaderboard();
    return {
      message: "Leaderboard synchronization complete",
      ...result
    };
  }

  /**
   * GET /leaderboard/search
   * Search for users and return their current leaderboard standings.
   */
  async searchLeaderboard(req: ControllerRequest<never, any, { q?: string; limit?: string }>) {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit || "20", 10);
    
    if (!query) {
      return { entries: [] };
    }

    return await this.statsService.searchLeaderboard(query, limit);
>>>>>>> prod-deploy
  }
}
