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
};
