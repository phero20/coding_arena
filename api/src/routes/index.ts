import { Hono } from "hono";
import { container } from "../libs/awilix-container";
import type { AppEnv } from "../types/infrastructure/hono.types";

import { registerAuthRoutes } from "./auth/auth.routes";
import { registerProblemRoutes } from "./problems/problem.routes";
import { registerProblemTestRoutes } from "./problems/problem-test.routes";
import { registerSubmissionRoutes } from "./submissions/submission.routes";
import { registerAiProblemRoutes } from "./problems/ai-problem.routes";
import { registerArenaRoutes } from "./arena/arena.routes";
import { registerStatsRoutes } from "./stats/stats.routes";
import { registerFollowRoutes } from "./user/follow.routes";
import { registerProfileRoutes } from "./user/profile.routes";
import { registerUserRoutes } from "./user/user.routes";
import { registerCompilerRoutes } from "./compiler.routes";


import { healthRoutes } from "./system/health.routes";

export const registerRoutes = (app: Hono<AppEnv>) => {
  const {
    authController,
    clerkWebhookController,
    problemController,
    problemTestController,
    submissionController,
    aiProblemController,
    arenaController,
    statsController,
    followController,
    profileController,
    userController,
    compilerController,
    authMiddleware,
    authorizationMiddleware,
    rateLimitMiddleware,
  } = container.cradle;

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
 
  registerStatsRoutes(v1, {
    statsController,
    authMiddleware,
  });
 
  registerFollowRoutes(v1, {
    followController,
    authMiddleware,
  });

  registerProfileRoutes(v1, {
    profileController,
    authMiddleware,
  });

  registerUserRoutes(v1, {
    userController,
    authMiddleware,
  });

  registerCompilerRoutes(v1, {
    compilerController,
    rateLimitMiddleware,
  });
 
  app.route("/api/v1", v1);
};
