import { Hono } from "hono";
import { type StatsController } from "../../controllers/stats/stats.controller";
import { type AppEnv } from "../../types/infrastructure/hono.types";

import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";

export interface StatsRoutesDeps {
  statsController: StatsController;
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
}

export const registerStatsRoutes = (
  app: Hono<AppEnv>,
  deps: StatsRoutesDeps,
) => {
  const { statsController, authMiddleware, authorizationMiddleware } = deps;

  /**
   * GET /stats/profile/:username
   * Public endpoint to retrieve user performance analytics.
   */
  app.get(
    "/stats/profile/:username",
    (c, next) => authMiddleware.handle(c, next),
    statsController.action(statsController.getProfileStats, {
      requireAuth: false,
    }),
  );

  /**
   * GET /stats/leaderboard
   * Public endpoint for the global rankings.
   */
  app.get(
    "/stats/leaderboard",
    (c, next) => authMiddleware.handle(c, next),
    statsController.action(statsController.getLeaderboard, {
      requireAuth: false,
    }),
  );

  /**
   * GET /stats/leaderboard/search
   * Search for users and return their current leaderboard standings.
   */
  app.get(
    "/stats/leaderboard/search",
    statsController.action(statsController.searchLeaderboard, {
      requireAuth: false,
    }),
  );

  /**
   * POST /stats/leaderboard/sync
   * Admin-only trigger to prime Redis.
   */
  app.post(
    "/stats/leaderboard/sync",
    authMiddleware.handle.bind(authMiddleware),
    authorizationMiddleware.requireRoles("admin"),
    statsController.action(statsController.syncLeaderboard),
  );
};
