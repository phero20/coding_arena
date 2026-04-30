import { createContainer, InjectionMode, asValue } from "awilix";
import type { Queue } from "bullmq";

// --- Registries ---
import { repositoriesRegistry } from "./di/repositories.registry";
import { servicesRegistry } from "./di/services.registry";
import { controllersRegistry } from "./di/controllers.registry";

// --- Injected Core Types ---
import { type SystemClockService } from "../services/common/clock.service";
import { type ILogger } from "./utils/logger";
import { type ErrorMiddleware } from "../middlewares/observability/error.middleware";
import { type UserRepository } from "../repositories/user/user.repository";
import { type ProblemRepository } from "../repositories/problems/problem.repository";
import { type ProblemTestRepository } from "../repositories/problems/problem-test.repository";
import { type SubmissionRepository } from "../repositories/submissions/submission.repository";
import { type ArenaRepository } from "../repositories/arena/arena.repository";
import { type ArenaMatchRepository } from "../repositories/arena/arena-match.repository";
import { type ArenaSubmissionRepository } from "../repositories/arena/arena-submission.repository";
import { type AuthService } from "../services/auth/auth.service";
import { type ProblemService } from "../services/problems/problem.service";
import { type ProblemTestService } from "../services/problems/problem-test.service";
import { type SubmissionService } from "../services/submissions/submission.service";
import { type GroqLlmService } from "../services/ai/groq-llm.service";
import { type AiProblemService } from "../services/problems/ai-problem.service";
import { type ArenaService } from "../services/arena/arena.service";
import { type ArenaMatchService } from "../services/arena/arena-match.service";
import { type MatchValidatorService } from "../services/arena/match-validator.service";
import { type AiCodeJudgeService } from "../services/judge/ai-code-judge.service";
import { type ExecutionService } from "../services/submissions/execution.service";
import { type ProblemValidatorService } from "../services/problems/problem-validator.service";
import { type MatchDomainEngine } from "../services/arena/match-domain-engine.service";
import { type MatchBroadcasterService } from "../services/arena/match-broadcaster.service";

import { type ProblemCache } from "../cache/problems/problem.cache";
import { type ProblemTestCache } from "../cache/problems/problem-test.cache";
import { type AiJudgeCache } from "../cache/judge/ai-judge.cache";

import { type AuthMiddleware } from "../middlewares/security/auth.middleware";
import { type AuthorizationMiddleware } from "../middlewares/security/authorization.middleware";
import { type RequestLoggerMiddleware } from "../middlewares/observability/request-logger.middleware";
import { type RateLimitMiddleware } from "../middlewares/security/rate-limit.middleware";
import { type SubmissionEvaluator } from "../workers/submission/evaluator";

import { type AuthController } from "../controllers/auth/auth.controller";
import { type ClerkWebhookController } from "../controllers/auth/clerk-webhook.controller";
import { type ProblemController } from "../controllers/problems/problem.controller";
import { type ProblemTestController } from "../controllers/problems/problem-test.controller";
import { type SubmissionController } from "../controllers/submissions/submission.controller";
import { type AiProblemController } from "../controllers/problems/ai-problem.controller";
import { type ArenaController } from "../controllers/arena/arena.controller";

// --- Infrastructure ---
import { submissionQueue, arenaCleanupQueue } from "./core/queue";

/**
 * Type Definition for the DI Container Cradle.
 * This is the ultimate source of truth for dependencies across the platform.
 */
export interface ICradle {
  // Infrastructure
  submissionQueue: Queue;
  arenaCleanupQueue: Queue;
  clockService: SystemClockService;
  logger: ILogger;

  // Repositories
  userRepository: UserRepository;
  problemRepository: ProblemRepository;
  problemTestRepository: ProblemTestRepository;
  submissionRepository: SubmissionRepository;
  arenaRepository: ArenaRepository;
  arenaMatchRepository: ArenaMatchRepository;
  arenaSubmissionRepository: ArenaSubmissionRepository;

  // Services (Primary/Cached)
  authService: AuthService;
  problemService: ProblemService;
  problemTestService: ProblemTestService;
  submissionService: SubmissionService;
  groqLlmService: GroqLlmService;
  llm: GroqLlmService;
  aiProblemService: AiProblemService;
  arenaMatchService: ArenaMatchService;
  arenaService: ArenaService;
  matchValidatorService: MatchValidatorService;
  problemValidatorService: ProblemValidatorService;
  aiCodeJudgeService: AiCodeJudgeService;
  matchDomainEngine: MatchDomainEngine;
  matchBroadcaster: MatchBroadcasterService;

  // Raw Services
  rawProblemService: ProblemService;
  rawProblemTestService: ProblemTestService;
  rawAiCodeJudgeService: AiCodeJudgeService;

  // Middlewares
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;
  requestLoggerMiddleware: RequestLoggerMiddleware;
  rateLimitMiddleware: RateLimitMiddleware;
  errorMiddleware: ErrorMiddleware;

  // Specialized
  submissionEvaluator: SubmissionEvaluator;
  executionService: ExecutionService;

  // Explicit Caches
  problemCache: ProblemCache;
  problemTestCache: ProblemTestCache;
  aiJudgeCache: AiJudgeCache;

  // Controllers
  authController: AuthController;
  clerkWebhookController: ClerkWebhookController;
  problemController: ProblemController;
  problemTestController: ProblemTestController;
  submissionController: SubmissionController;
  aiProblemController: AiProblemController;
  arenaController: ArenaController;
}

const container = createContainer<ICradle>({
  injectionMode: InjectionMode.PROXY,
});

/**
 * Compose the container by merging logical registries.
 * This structural refinement ensures high-performance dependency resolution.
 */
container.register({
  // Infrastructure
  submissionQueue: asValue(submissionQueue),
  arenaCleanupQueue: asValue(arenaCleanupQueue),
  logger: asValue(require("./utils/logger").logger),

  // Feature Layers
  ...repositoriesRegistry,
  ...servicesRegistry,
  ...controllersRegistry,
});

export { container };
export default container;
