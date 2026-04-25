import type { Context } from "hono";
import { ApiResponse } from "../../utils/api-response";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("auth-controller");

import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";

export class AuthController extends BaseController {
  constructor(cradle: ICradle) {
    super(cradle);
  }
  async me(c: Context) {
    const auth = c.get("auth");

    const { user } = auth;

    const response = ApiResponse.success({
      id: user.id,
      clerkId: user.clerkId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: user.role,
    });

    return c.json(response.toJSON());
  }
}
