import type { Context } from "hono";
import { ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";
import { ApiResponse } from "../../utils/api-response";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("auth-controller");

import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";

export class AuthController extends BaseController {
  constructor(cradle: ICradle) {
    super(cradle);
  }
  /**
   * Returns current authenticated user profile.
   */
  async me(req: ControllerRequest) {
    const user = req.user;
    if (!user) throw AppError.unauthorized();

    return {
      id: user.id,
      clerkId: user.clerkId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: user.role,
    };
  }
}
