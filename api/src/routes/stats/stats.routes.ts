import { Hono } from "hono";
import { type StatsController } from "../../controllers/stats/stats.controller";
import { type AppEnv } from "../../types/infrastructure/hono.types";

import { type AuthMiddleware } from "../../middlewares/security/auth.middleware";

export interface StatsRoutesDeps {
  statsController: StatsController;
  authMiddleware: AuthMiddleware;
}

export const registerStatsRoutes = (
  app: Hono<AppEnv>,
  deps: StatsRoutesDeps,
) => {
  const { statsController, authMiddleware } = deps;

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
    statsController.action(statsController.getLeaderboard, {
      requireAuth: false,
    }),
  );
};
