import { Hono } from "hono";
import { container } from "../libs/awilix-container";
import type { AppEnv } from "../types/infrastructure/hono.types";

import { registerAuthRoutes } from "./auth/auth.routes";
import { registerProblemRoutes } from "./problems/problem.routes";
import { registerProblemTestRoutes } from "./problems/problem-test.routes";
import { registerSubmissionRoutes } from "./submissions/submission.routes";
import { registerAiProblemRoutes } from "./problems/ai-problem.routes";
import { registerArenaRoutes } from "./arena/arena.routes";

import { healthRoutes } from "./system/health.routes";

const {
  authController,
  clerkWebhookController,
  problemController,
  problemTestController,
  submissionController,
  aiProblemController,
  arenaController,
  authMiddleware,
  authorizationMiddleware,
  rateLimitMiddleware,
} = container.cradle;

export const registerRoutes = (app: Hono<AppEnv>) => {
  app.get("/", (c) => c.text("OK"));

  // Health monitoring
  app.route("/health", healthRoutes);
  const v1 = new Hono<AppEnv>();

  const authApp = new Hono<AppEnv>();
  registerAuthRoutes(authApp, {
    authMiddleware,
    authorizationMiddleware,
    authController,
    clerkWebhookController,
  });
  v1.route("/auth", authApp);

  registerProblemRoutes(v1, {
    problemController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerProblemTestRoutes(v1, {
    problemTestController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerSubmissionRoutes(v1, {
    authMiddleware,
    authorizationMiddleware,
    submissionController,
    rateLimitMiddleware,
  });

  registerAiProblemRoutes(v1, {
    aiProblemController,
  });

  registerArenaRoutes(v1, {
    arenaController,
    authMiddleware,
  });

  app.route("/api/v1", v1);
};
