import { Hono } from "hono";
import { container } from "../libs/awilix-container";
import type { AppEnv } from "../types/infrastructure/hono.types";

import { registerAuthRoutes } from "./auth/auth.routes";
import { registerProblemRoutes } from "./problems/problem.routes";
import { registerProblemAdminRoutes } from "./problems/problem.admin.routes";
import { registerProblemTestRoutes } from "./problems/problem-test.routes";
import { registerSubmissionRoutes } from "./submissions/submission.routes";
import { registerAiProblemRoutes } from "./problems/ai-problem.routes";
import { registerArenaRoutes } from "./arena/arena.routes";
import { registerArenaAdminRoutes } from "./arena/arena.admin.routes";
import { registerStatsRoutes } from "./stats/stats.routes";
import { registerFollowRoutes } from "./user/follow.routes";
import { registerProfileRoutes } from "./user/profile.routes";
import { registerUserRoutes } from "./user/user.routes";
import { registerUserAdminRoutes } from "./user/user.admin.routes";
import { registerCompilerRoutes } from "./compiler.routes";
import { registerContestRoutes } from "./contest/contest.routes";
import { registerContestAdminRoutes } from "./contest/contest.admin.routes";
import { registerTaxonomyRoutes } from "./taxonomy/taxonomy.routes";
import { registerTaxonomyAdminRoutes } from "./taxonomy/taxonomy.admin.routes";
import { registerSolutionRoutes } from "./solutions/solution.routes";
import { registerWorkspaceRoutes } from "./workspace/workspace.routes";
import { registerChatRoutes } from "./chat/chat.routes";
import { registerAcademyRoutes } from "./academy/academy.routes";
import { registerAcademyAdminRoutes } from "./academy/academy.admin.routes";
import { registerSystemDesignRoutes } from "./system-design/system-design.routes";
import { registerSystemDesignAdminRoutes } from "./system-design/system-design.admin.routes";
import { registerCompanyRoutes } from "./company/company.routes";
import { registerCompanyAdminRoutes } from "./company/company.admin.routes";
import { registerSeoRoutes } from "./seo/seo.routes";
import { registerReportBugRoutes } from "./report-bug/report-bug.routes";
import { registerReportBugAdminRoutes } from "./report-bug/report-bug.admin.routes";

import { healthRoutes } from "./system/health.routes";
import { registerCacheAdminRoutes } from "./system/cache.admin.routes";

export const registerRoutes = (app: Hono<AppEnv>) => {
  const {
    authController,
    clerkWebhookController,
    problemController,
    problemAdminController,
    problemTestController,
    submissionController,
    aiProblemController,
    arenaController,
    arenaAdminController,
    statsController,
    followController,
    profileController,
    userController,
    userAdminController,
    compilerController,
    contestController,
    contestAdminController,
    taxonomyController,
    taxonomyAdminController,
    solutionController,
    workspaceController,
    chatController,
    academyController,
    academyExecutionController,
    academyAdminController,
    systemDesignController,
    systemDesignAdminController,
    companyController,
    companyAdminController,
    seoController,
    reportBugController,
    reportBugAdminController,
    cacheAdminController,
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

  registerProblemAdminRoutes(v1, {
    problemAdminController,
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
    rateLimitMiddleware,
  });

  registerArenaAdminRoutes(v1, {
    arenaAdminController,
    authMiddleware,
    authorizationMiddleware,
  });
 
  registerReportBugRoutes(v1, {
    reportBugController,
  });

  registerReportBugAdminRoutes(v1, {
    reportBugAdminController,
    authMiddleware,
    authorizationMiddleware,
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

  registerUserAdminRoutes(v1, {
    userAdminController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerCompilerRoutes(v1, {
    compilerController,
    rateLimitMiddleware,
  });

  registerContestRoutes(v1, {
    contestController,
  });

  registerContestAdminRoutes(v1, {
    contestAdminController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerTaxonomyRoutes(v1, {
    taxonomyController,
    authMiddleware,
    authorizationMiddleware,
  });
 
  registerTaxonomyAdminRoutes(v1, {
    taxonomyAdminController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerSolutionRoutes(v1, {
    solutionController,
    authMiddleware,
  });

  registerWorkspaceRoutes(v1, {
    workspaceController,
    authMiddleware,
  });

  registerChatRoutes(v1, {
    chatController,
    authMiddleware,
  });
  
  registerAcademyRoutes(v1, {
    academyController,
    academyExecutionController,
    authMiddleware,
    rateLimitMiddleware,
  });

  registerAcademyAdminRoutes(v1, {
    academyAdminController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerSystemDesignRoutes(v1, {
    systemDesignController,
  });

  registerSystemDesignAdminRoutes(v1, {
    systemDesignAdminController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerCompanyRoutes(v1, {
    companyController,
  });

  registerCompanyAdminRoutes(v1, {
    companyAdminController,
    authMiddleware,
    authorizationMiddleware,
  });

  registerSeoRoutes(v1, {
    seoController,
  });

  registerReportBugRoutes(v1, {
    reportBugController,
  });

  registerReportBugAdminRoutes(v1, {
    reportBugAdminController,
    authMiddleware,
    authorizationMiddleware,
  });
 
  registerCacheAdminRoutes(v1, {
    cacheAdminController,
    authMiddleware,
    authorizationMiddleware,
  });
 
  app.route("/api/v1", v1);
};
