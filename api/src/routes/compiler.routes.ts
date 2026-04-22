import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { type CompilerController } from "../controllers/compiler/compiler.controller";
import { type RateLimitMiddleware } from "../middlewares/security/rate-limit.middleware";
import { type AppEnv } from "../types/infrastructure/hono.types";
import { ExecuteCodeSchema } from "../services/validation/compiler.validator";

export interface CompilerRoutesDeps {
  compilerController: CompilerController;
  rateLimitMiddleware: RateLimitMiddleware;
}

/**
 * Compiler routes for public code execution.
 */
export const registerCompilerRoutes = (
  app: Hono<AppEnv>,
  deps: CompilerRoutesDeps,
) => {
  const { compilerController, rateLimitMiddleware } = deps;

  // GET /api/v1/compiler/languages
  app.get(
    "/compiler/languages",
    compilerController.action(compilerController.getLanguages, {
      requireAuth: false,
    }),
  );

  // POST /api/v1/compiler/execute
  // Public route with strict rate limiting (5 requests per minute)
  app.post(
    "/compiler/execute",
    rateLimitMiddleware.limit({
      windowMs: 60000,
      max: 5,
      keyPrefix: "rl:compiler",
    }),
    zValidator("json", ExecuteCodeSchema),
    compilerController.action(compilerController.execute, {
      requireAuth: false,
    }),
  );
};
