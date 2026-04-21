import { Hono } from "hono";
import { container } from "../libs/awilix-container";
import type { AppEnv } from "../types/hono.types";

import { registerAuthRoutes } from "./auth.routes";
import { registerProblemRoutes } from "./problem.routes";
import { registerProblemTestRoutes } from "./problem-test.routes";
import { registerSubmissionRoutes } from "./submission.routes";
import { registerAiProblemRoutes } from "./ai-problem.routes";
import { registerArenaRoutes } from "./arena.routes";

import { healthRoutes } from "./health.routes";

const { 
  authController, 
  clerkWebhookController, 
  problemController, 
  problemTestController, 
  submissionController, 
  aiProblemController, 
  arenaController,
  authMiddleware,
  authorizationMiddleware
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
