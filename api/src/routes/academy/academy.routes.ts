import { Hono } from "hono";
import type { AppEnv } from "../../types/infrastructure/hono.types";
import { type AcademyController } from "../../controllers/academy/academy.controller";
import { type AcademyExecutionController, RunAcademyExerciseSchema } from "../../controllers/academy/academy-execution.controller";
import { zValidator } from "@hono/zod-validator";

import type { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import type { RateLimitMiddleware } from "../../middlewares/security/rate-limit.middleware";

export interface AcademyRouteDependencies {
  academyController: AcademyController;
  academyExecutionController: AcademyExecutionController;
  authMiddleware: AuthMiddleware;
  rateLimitMiddleware: RateLimitMiddleware;
}

export const registerAcademyRoutes = (
  app: Hono<AppEnv>,
  deps: AcademyRouteDependencies
) => {
  const { academyController, academyExecutionController, authMiddleware, rateLimitMiddleware } = deps;
  const academyApp = new Hono<AppEnv>();

  // GET /api/v1/academy/tracks
  academyApp.get(
    "/tracks",
    academyController.action(academyController.getTracks, { requireAuth: false })
  );
  
  // GET /api/v1/academy/tracks/:slug
  academyApp.get(
    "/tracks/:slug",
    academyController.action(academyController.getTrackConfig, { requireAuth: false })
  );

  // GET /api/v1/academy/tracks/:trackSlug/solved
  // Must be placed before /concepts/:conceptSlug so 'solved' isn't mistaken for a conceptSlug
  academyApp.get(
    "/tracks/:trackSlug/solved",
    authMiddleware.handle.bind(authMiddleware),
    academyController.action(academyController.getSolvedExercises, { requireAuth: true })
  );

  // GET /api/v1/academy/tracks/:trackSlug/concepts/:conceptSlug
  academyApp.get(
    "/tracks/:trackSlug/concepts/:conceptSlug",
    academyController.action(academyController.getTrackConcept, { requireAuth: false })
  );

  // GET /api/v1/academy/tracks/:trackSlug/exercises/:exerciseSlug
  academyApp.get(
    "/tracks/:trackSlug/exercises/:exerciseSlug",
    academyController.action(academyController.getTrackExercise, { requireAuth: false })
  );

  // POST /api/v1/academy/tracks/:trackSlug/exercises/:exerciseSlug/run
  academyApp.post(
    "/tracks/:trackSlug/exercises/:exerciseSlug/run",
    authMiddleware.handle.bind(authMiddleware),
    rateLimitMiddleware.limit({
      windowMs: 60000,
      max: 10,
      keyPrefix: "rl:academy_run",
    }),
    zValidator("json", RunAcademyExerciseSchema),
    academyExecutionController.action(academyExecutionController.runExercise, { requireAuth: true })
  );

  app.route("/academy", academyApp);
};
