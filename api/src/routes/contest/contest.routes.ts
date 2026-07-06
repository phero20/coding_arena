import { Hono } from "hono";
import { ICradle } from "../../libs/awilix-container";
import type { AppEnv } from "../../types/infrastructure/hono.types";

/**
 * Registers contest-related routes.
 */
export const registerContestRoutes = (
  app: Hono<AppEnv>,
  {
    contestController,
  }: Pick<ICradle, "contestController">
) => {
  const contestApp = new Hono<AppEnv>();

  // Main endpoint for upcoming contests (Redis-backed)
  contestApp.get("/", contestController.getUpcomingContests);

  app.route("/contests", contestApp);
};
