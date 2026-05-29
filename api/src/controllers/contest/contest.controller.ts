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
   * GET /api/v1/contests/external
   * Fetches contests from external sources like CLIST.
   */
  getExternalContests = this.action(
    async (req) => {
      const limit = parseInt((req.query as any).limit || "20");
      const offset = parseInt((req.query as any).offset || "0");

      logger.info({ limit, offset }, "Controller: Requesting external contests");
      return await this.contestService.getExternalContests(limit, offset);
    },
    { requireAuth: false }
  );

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

  /**
   * POST /api/v1/contests/sync
   * Manually triggers a synchronization of external contests.
   */
  syncContests = this.action(
    async () => {
      logger.info("Controller: Manually triggering contest sync");
      await this.contestService.syncExternalContests();
      return { success: true, message: "Contest synchronization triggered" };
    },
    { requireAuth: false }
  );
}
