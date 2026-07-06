import { BaseController } from "../base.controller";
import { ICradle } from "../../libs/awilix-container";
import { ContestService } from "../../services/contest/contest.service";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("contest-controller");

/**
 * ContestController handles HTTP requests for contest-related data.
 */
export class ContestController extends BaseController {
  private readonly contestService: ContestService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.contestService = cradle.contestService;
  }

  /**
   * GET /api/v1/contests
   * Main endpoint for upcoming contests (served from Redis/DB).
   */
  getUpcomingContests = this.action(
    async (req) => {
      const limit = parseInt((req.query as any).limit || "200");
      logger.info({ limit }, "Controller: Fetching upcoming contests");
      return await this.contestService.getUpcomingContests(limit);
    },
    { requireAuth: false }
  );
}
