import { Hono } from "hono";
import { type UserController } from "../../controllers/user/user.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface UserRouteDependencies {
  userController: UserController;
  authMiddleware: AuthMiddleware;
}

export const registerUserRoutes = (
  app: Hono<AppEnv>,
  deps: UserRouteDependencies,
) => {
  const { userController, authMiddleware } = deps;

  /**
   * GET /api/v1/users/search
   * Global user search query.
   */
  app.get(
    "/users/search",
    (c, next) => authMiddleware.handle(c, next),
    userController.action(userController.searchUsers, { requireAuth: false }),
  );
};
