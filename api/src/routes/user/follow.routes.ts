import { Hono } from "hono";
import { type FollowController } from "../../controllers/user/follow.controller";
import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { AppEnv } from "../../types/infrastructure/hono.types";

export interface FollowRouteDependencies {
  followController: FollowController;
  authMiddleware: AuthMiddleware;
}

export const registerFollowRoutes = (
  app: Hono<AppEnv>,
  deps: FollowRouteDependencies,
) => {
  const { followController, authMiddleware } = deps;

  /**
   * POST /follows/:username
   * Start following a user.
   */
  app.post(
    "/follows/:username",
    (c, next) => authMiddleware.handle(c, next),
    followController.action(followController.follow),
  );

  /**
   * DELETE /follows/:username
   * Stop following a user.
   */
  app.delete(
    "/follows/:username",
    (c, next) => authMiddleware.handle(c, next),
    followController.action(followController.unfollow),
  );

  /**
   * GET /follows/:username/followers
   * Public: List users following this account.
   */
  app.get(
    "/follows/:username/followers",
    followController.action(followController.getFollowers, {
      requireAuth: false,
    }),
  );

  /**
   * GET /follows/:username/following
   * Public: List accounts followed by this user.
   */
  app.get(
    "/follows/:username/following",
    followController.action(followController.getFollowing, {
      requireAuth: false,
    }),
  );
};
