import * as repos from "./containers/repo.container";
import * as services from "./containers/service.container";
import * as caches from "./containers/cache.container";
import * as middlewares from "./containers/middleware.container";
import * as controllers from "./containers/controller.container";

/**
 * Centralized Dependency Injection Container.
 * Aggregates all modular containers into a single source of truth.
 * 
 * This keeps the application wiring clean, modular, and easy to maintain.
 */
export const container = {
  middlewares: {
    authMiddleware: middlewares.authMiddleware,
    authorizationMiddleware: middlewares.authorizationMiddleware,
  },
  controllers: {
    authController: controllers.authController,
    clerkWebhookController: controllers.clerkWebhookController,
    problemController: controllers.problemController,
    problemTestController: controllers.problemTestController,
    submissionController: controllers.submissionController,
    arenaController: controllers.arenaController,
    aiProblemController: controllers.aiProblemController,
  },
  services: {
    authService: services.authService,
    problemService: services.problemService,
    submissionService: services.submissionService,
    arenaService: services.arenaService,
    executionService: caches.executionService,
  },
  repositories: {
    userRepository: repos.userRepository,
    problemRepository: repos.problemRepository,
    problemTestRepository: repos.problemTestRepository,
    submissionRepository: repos.submissionRepository,
    arenaRepository: repos.arenaRepository,
    arenaMatchRepository: repos.arenaMatchRepository,
    arenaSubmissionRepository: repos.arenaSubmissionRepository,
  },
  specialists: {
    submissionEvaluator: caches.submissionEvaluator,
  },
  caches: {
    problemCache: caches.problemCache,
    problemTestCache: caches.problemTestCache,
    aiJudgeCache: caches.aiJudgeCache,
  }
};
