import { createContainer, asClass, asValue, InjectionMode, asFunction } from "awilix";
import type { Queue } from "bullmq";

// --- Repositories ---
import { UserRepository } from "../repositories/user.repository";
import { ProblemRepository } from "../repositories/problem.repository";
import { ProblemTestRepository } from "../repositories/problem-test.repository";
import { SubmissionRepository } from "../repositories/submission.repository";
import { ArenaRepository } from "../repositories/arena.repository";
import { ArenaMatchRepository } from "../repositories/arena-match.repository";
import { ArenaSubmissionRepository } from "../repositories/arena-submission.repository";

// --- Services ---
import { AuthService } from "../services/auth.service";
import { ProblemService } from "../services/problem.service";
import { ProblemTestService } from "../services/problem-test.service";
import { SubmissionService } from "../services/submission.service";
import { GroqLlmService } from "../services/groq-llm.service";
import { AiProblemService } from "../services/ai-problem.service";
import { ArenaService } from "../services/arena.service";
import { ArenaMatchService } from "../services/arena-match.service";
import { MatchValidatorService } from "../services/match-validator.service";
import { AiCodeJudgeService } from "../services/ai-code-judge.service";
import { ExecutionService } from "../services/execution.service";
import { ProblemValidatorService } from "../services/problem-validator.service";

// --- Caches ---
import { ProblemCache } from "../cache/problem.cache";
import { ProblemTestCache } from "../cache/problem-test.cache";
import { AiJudgeCache } from "../cache/ai-judge.cache";

// --- Middlewares ---
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AuthorizationMiddleware } from "../middlewares/authorization.middleware";

// --- Specialized ---
import { SubmissionEvaluator } from "../workers/submission/evaluator";

// --- Controllers ---
import { AuthController } from "../controllers/auth.controller";
import { ClerkWebhookController } from "../controllers/clerk-webhook.controller";
import { ProblemController } from "../controllers/problem.controller";
import { ProblemTestController } from "../controllers/problem-test.controller";
import { SubmissionController } from "../controllers/submission.controller";
import { AiProblemController } from "../controllers/ai-problem.controller";
import { ArenaController } from "../controllers/arena.controller";

// --- Infrastructure ---
import { submissionQueue, arenaCleanupQueue } from "./queue";

/**
 * Type Definition for the DI Container Cradle.
 * This ensures full TypeScript support when resolving dependencies.
 */
export interface ICradle {
  // Infrastructure
  submissionQueue: Queue;
  arenaCleanupQueue: Queue;

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
  problemService: ProblemService; // Cached via ProblemCache
  problemTestService: ProblemTestService; // Cached via ProblemTestCache
  submissionService: SubmissionService;
  groqLlmService: GroqLlmService;
  llm: GroqLlmService; // Alias for groqLlmService
  aiProblemService: AiProblemService;
  arenaMatchService: ArenaMatchService;
  arenaService: ArenaService;
  matchValidatorService: MatchValidatorService;
  problemValidatorService: ProblemValidatorService;
  aiCodeJudgeService: AiCodeJudgeService; // Cached via AiJudgeCache

  // Raw Services
  rawProblemService: ProblemService;
  rawProblemTestService: ProblemTestService;
  rawAiCodeJudgeService: AiCodeJudgeService;

  // Middlewares
  authMiddleware: AuthMiddleware;
  authorizationMiddleware: AuthorizationMiddleware;

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

/**
 * Modern Dependency Injection Container (Awilix)
 * 
 * We use CLASSIC mode to support existing constructor signatures (positional arguments).
 * In CLASSIC mode, asFunction(fn) resolves dependencies by looking at the parameter names of 'fn'.
 */
const container = createContainer<ICradle>({
  injectionMode: InjectionMode.CLASSIC, 
});

container.register({
  // --- Infrastructure (Queues) ---
  submissionQueue: asValue(submissionQueue),
  arenaCleanupQueue: asValue(arenaCleanupQueue),

  // --- Repositories ---
  userRepository: asClass(UserRepository).singleton(),
  problemRepository: asClass(ProblemRepository).singleton(),
  problemTestRepository: asClass(ProblemTestRepository).singleton(),
  submissionRepository: asClass(SubmissionRepository).singleton(),
  arenaRepository: asClass(ArenaRepository).singleton(),
  arenaMatchRepository: asClass(ArenaMatchRepository).singleton(),
  arenaSubmissionRepository: asClass(ArenaSubmissionRepository).singleton(),

  // --- Core Services ---
  authService: asClass(AuthService).singleton(),
  
  // Raw services used as targets for Caches
  rawProblemService: asClass(ProblemService).singleton(),
  rawProblemTestService: asClass(ProblemTestService).singleton(),
  rawAiCodeJudgeService: asFunction((llm: GroqLlmService, problemService: ProblemService) => new AiCodeJudgeService(llm, problemService)).singleton(),

  submissionService: asClass(SubmissionService).singleton(),
  groqLlmService: asClass(GroqLlmService).singleton(),
  
  // ALIASES - In CLASSIC mode, parameter names must match container keys.
  llm: asFunction((groqLlmService: GroqLlmService) => groqLlmService).singleton(),
  
  // Services with specific dependencies
  aiProblemService: asFunction((llm: GroqLlmService) => new AiProblemService(llm)).singleton(),
  
  arenaMatchService: asClass(ArenaMatchService).singleton(),
  arenaService: asClass(ArenaService).singleton(),
  matchValidatorService: asClass(MatchValidatorService).singleton(),
  problemValidatorService: asClass(ProblemValidatorService).singleton(),

  // --- Caches (Decorators) ---
  // We use the 'raw' services to prevent circular dependency loops
  problemCache: asFunction((rawProblemService: ProblemService) => new ProblemCache(rawProblemService)).singleton(),
  problemTestCache: asFunction((rawProblemTestService: ProblemTestService) => new ProblemTestCache(rawProblemTestService)).singleton(),
  aiJudgeCache: asFunction((rawAiCodeJudgeService: AiCodeJudgeService) => new AiJudgeCache(rawAiCodeJudgeService)).singleton(),

  // Primary service aliases pointing to caches
  problemService: asFunction((problemCache: ProblemCache) => problemCache).singleton(),
  problemTestService: asFunction((problemTestCache: ProblemTestCache) => problemTestCache).singleton(),
  aiCodeJudgeService: asFunction((aiJudgeCache: AiJudgeCache) => aiJudgeCache).singleton(),

  // --- Middlewares ---
  authMiddleware: asClass(AuthMiddleware).singleton(),
  authorizationMiddleware: asClass(AuthorizationMiddleware).singleton(),

  // --- Specialized Services & Evaluators ---
  submissionEvaluator: asFunction((problemTestRepository: ProblemTestRepository, aiJudgeCache: AiJudgeCache) => 
    new SubmissionEvaluator(problemTestRepository, aiJudgeCache)
  ).singleton(),
  
  executionService: asClass(ExecutionService).singleton(),

  // --- Controllers ---
  authController: asClass(AuthController).singleton(),
  clerkWebhookController: asClass(ClerkWebhookController).singleton(),
  problemController: asClass(ProblemController).singleton(),
  problemTestController: asClass(ProblemTestController).singleton(),
  submissionController: asClass(SubmissionController).singleton(),
  aiProblemController: asClass(AiProblemController).singleton(),
  arenaController: asClass(ArenaController).singleton(),
});

export { container };
export default container;
