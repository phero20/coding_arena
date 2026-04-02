import { UserRepository } from '../repositories/user.repository'
import { ProblemRepository } from '../repositories/problem.repository'
import { ProblemTestRepository } from '../repositories/problem-test.repository'
import { SubmissionRepository } from '../repositories/submission.repository'
import { AuthService } from '../services/auth.service'
import { ProblemService } from '../services/problem.service'
import { ProblemTestService } from '../services/problem-test.service'
import { SubmissionService } from '../services/submission.service'
import { ExecutionService } from '../services/execution.service'
import { AiProblemService } from '../services/ai-problem.service'
import { AiCodeJudgeService } from '../services/ai-code-judge.service'
import { AiJudgeCache } from '../cache/ai-judge.cache'
import { GroqLlmService } from '../services/groq-llm.service'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware'
import { AuthController } from '../controllers/auth.controller'
import { ClerkWebhookController } from '../controllers/clerk-webhook.controller'
import { ProblemController } from '../controllers/problem.controller'
import { ProblemTestController } from '../controllers/problem-test.controller'
import { SubmissionController } from '../controllers/submission.controller'
import { AiProblemController } from '../controllers/ai-problem.controller'
import { ProblemCache } from '../cache/problem.cache'
import { ProblemTestCache } from '../cache/problem-test.cache'
import { ArenaRepository } from '../repositories/arena.repository'
import { ArenaController } from '../controllers/arena.controller'

// --- Repositories ---
const userRepository = new UserRepository()
const problemRepository = new ProblemRepository()
const problemTestRepository = new ProblemTestRepository()
const submissionRepository = new SubmissionRepository()
const arenaRepository = new ArenaRepository()

// --- Services ---
const authService = new AuthService(userRepository)
const problemService = new ProblemService(problemRepository)
const problemTestService = new ProblemTestService(problemTestRepository)
const submissionService = new SubmissionService(submissionRepository)

// --- Cache Layers (Wrappers) ---
const problemCache = new ProblemCache(problemService)
const problemTestCache = new ProblemTestCache(problemTestService)

const groqLlmService = new GroqLlmService()
const aiCodeJudgeService = new AiCodeJudgeService(groqLlmService, problemCache as any)
const aiJudgeCache = new AiJudgeCache(aiCodeJudgeService)

const executionService = new ExecutionService(
  problemTestCache as any,
  aiJudgeCache as any,
  submissionService,
)
const aiProblemService = new AiProblemService()

// --- Middlewares ---
const authMiddleware = new AuthMiddleware(authService)
const authorizationMiddleware = new AuthorizationMiddleware()

// --- Controllers ---
const authController = new AuthController()
const clerkWebhookController = new ClerkWebhookController(authService)
const problemController = new ProblemController(problemCache as any)
const problemTestController = new ProblemTestController(problemTestCache as any)
const submissionController = new SubmissionController(
  submissionService,
  executionService,
)
const aiProblemController = new AiProblemController(
  aiProblemService,
  problemCache as any,
  problemTestCache as any,
)
const arenaController = new ArenaController(arenaRepository, userRepository)

/**
 * Centalized Dependency Injection Container.
 * Manages the lifecycle and wiring of all application components.
 */
export const container = {
  middlewares: {
    authMiddleware,
    authorizationMiddleware,
  },
  controllers: {
    authController,
    clerkWebhookController,
    problemController,
    problemTestController,
    submissionController,
    aiProblemController,
    arenaController,
  },
  repositories: {
    arenaRepository,
    userRepository,
  },
}
