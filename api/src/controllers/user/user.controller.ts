import { BaseController } from "../base.controller";
import { type IUserService } from "../../services/user/user.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("user.controller");

export class UserController extends BaseController {
  private readonly userService: IUserService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.userService = cradle.userService;
  }

  /**
   * GET /api/v1/users/search?q=query
   */
  async searchUsers(req: ControllerRequest<never, never, { q?: string }>) {
    const query = req.query.q;
    logger.debug({ query }, "Received search query");
    
    // Business logic and data retrieval now delegated to the Service layer
    const users = await this.userService.searchUsers(query || "");
    
    // Satisfy internal "Zero Leak" by returning only non-sensitive fields
    return users.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl
    }));
  }
}
