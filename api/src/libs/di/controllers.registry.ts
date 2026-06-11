import { asClass } from "awilix";

// --- Middlewares ---
import { AuthMiddleware } from "../../middlewares/security/auth.middleware";
import { AuthorizationMiddleware } from "../../middlewares/security/authorization.middleware";
import { RequestLoggerMiddleware } from "../../middlewares/observability/request-logger.middleware";
import { RateLimitMiddleware } from "../../middlewares/security/rate-limit.middleware";
import { ErrorMiddleware } from "../../middlewares/observability/error.middleware";

// --- Specialized ---
import { SubmissionEvaluator } from "../../workers/submission/evaluator";

// --- Controllers ---
import { AuthController } from "../../controllers/auth/auth.controller";
import { ClerkWebhookController } from "../../controllers/auth/clerk-webhook.controller";
import { ProblemController } from "../../controllers/problems/problem.controller";
import { ProblemTestController } from "../../controllers/problems/problem-test.controller";
import { SubmissionController } from "../../controllers/submissions/submission.controller";
import { AiProblemController } from "../../controllers/problems/ai-problem.controller";
import { ArenaController } from "../../controllers/arena/arena.controller";
import { StatsController } from "../../controllers/stats/stats.controller";
import { FollowController } from "../../controllers/user/follow.controller";
import { ProfileController } from "../../controllers/user/profile.controller";
import { UserController } from "../../controllers/user/user.controller";
import { CompilerController } from "../../controllers/compiler/compiler.controller";
import { ContestController } from "../../controllers/contest/contest.controller";
import { TaxonomyController } from "../../controllers/taxonomy/taxonomy.controller";
import { SolutionController } from "../../controllers/solutions/solution.controller";
import { WorkspaceController } from "../../controllers/workspace/workspace.controller";
import { ChatController } from "../../controllers/chat/chat.controller";
import { AcademyController } from "../../controllers/academy/academy.controller";
import { AcademyExecutionController } from "../../controllers/academy/academy-execution.controller";
import { SystemDesignController } from "../../controllers/system-design/system-design.controller";
import { CompanyController } from "../../controllers/company/company.controller";
import { SeoController } from "../../controllers/seo/seo.controller";
import { ReportBugController } from "../../controllers/report-bug/report-bug.controller";

/**
 * Controller and Middleware layer registrations.
 * This module manages the entry points and security guards for the API.
 */
export const controllersRegistry = {
  // Middlewares
  authMiddleware: asClass(AuthMiddleware).singleton(),
  authorizationMiddleware: asClass(AuthorizationMiddleware).singleton(),
  requestLoggerMiddleware: asClass(RequestLoggerMiddleware).singleton(),
  rateLimitMiddleware: asClass(RateLimitMiddleware).singleton(),
  errorMiddleware: asClass(ErrorMiddleware).singleton(),

  // Specialized evaluators
  submissionEvaluator: asClass(SubmissionEvaluator).singleton(),

  // API Controllers
  authController: asClass(AuthController).singleton(),
  clerkWebhookController: asClass(ClerkWebhookController).singleton(),
  problemController: asClass(ProblemController).singleton(),
  problemTestController: asClass(ProblemTestController).singleton(),
  submissionController: asClass(SubmissionController).singleton(),
  aiProblemController: asClass(AiProblemController).singleton(),
  arenaController: asClass(ArenaController).singleton(),
  statsController: asClass(StatsController).singleton(),
  followController: asClass(FollowController).singleton(),
  profileController: asClass(ProfileController).singleton(),
  userController: asClass(UserController).singleton(),
  compilerController: asClass(CompilerController).singleton(),
  contestController: asClass(ContestController).singleton(),
  taxonomyController: asClass(TaxonomyController).singleton(),
  solutionController: asClass(SolutionController).singleton(),
  workspaceController: asClass(WorkspaceController).singleton(),
  chatController: asClass(ChatController).singleton(),
  academyController: asClass(AcademyController).singleton(),
  academyExecutionController: asClass(AcademyExecutionController).singleton(),
  systemDesignController: asClass(SystemDesignController).singleton(),
  companyController: asClass(CompanyController).singleton(),
  seoController: asClass(SeoController).singleton(),
  reportBugController: asClass(ReportBugController).singleton(),
};
