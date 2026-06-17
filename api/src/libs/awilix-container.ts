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
import { type StatsRepository } from "../repositories/stats/stats.repository";
import { type ContestRepository } from "../repositories/contest/contest.repository";
import { type TaxonomyRepository } from "../repositories/taxonomy/taxonomy.repository";
import { type TaxonomyAdminRepository } from "../repositories/taxonomy/taxonomy.admin.repository";
import { type SolutionRepository } from "../repositories/solutions/solution.repository";
import { type WorkspaceRepository } from "../repositories/workspace/workspace.repository";
import { type AuthService } from "../services/auth/auth.service";
import { type ProblemService } from "../services/problems/problem.service";
import { type ProblemTestService } from "../services/problems/problem-test.service";
import { ISubmissionService, type SubmissionService } from "../services/submissions/submission.service";
import { type GroqLlmService } from "../services/ai/groq-llm.service";
import { type AiProblemService } from "../services/problems/ai-problem.service";
import { type AiAddSolveService } from "../services/problems/ai-addsolve.service";
import { type TestcaseGeneratorService } from "../services/problems/testcase-generator.service";
import { type ArenaService } from "../services/arena/arena.service";
import {
  type ArenaMatchService,
  type IArenaMatchService,
} from "../services/arena/arena-match.service";

import { type MatchValidatorService } from "../services/arena/match-validator.service";
import { type AiCodeJudgeService } from "../services/judge/ai-code-judge.service";
import { type AiVerdictAuditService } from "../services/judge/ai-verdict-audit.service";
import { type DriverJudgeExecutionService } from "../services/judge/driver-judge-execution.service";
import { type ExecutionService } from "../services/submissions/execution.service";
import { type ProblemValidatorService } from "../services/problems/problem-validator.service";
import { type MatchDomainEngine } from "../services/arena/match-domain-engine.service";
import { type MatchBroadcasterService } from "../services/arena/match-broadcaster.service";
import { type IStatsService } from "../services/stats/stats.service";
import { type Judge0Service } from "../services/judge/judge0.service";
import { type WandboxService } from "../services/judge/wandbox.service";
import { type CompilerService } from "../services/compiler/compiler.service";
import { type ClistService } from "../services/contest/clist.service";
import { type ContestService } from "../services/contest/contest.service";
import { type TaxonomyService } from "../services/taxonomy/taxonomy.service";
import { type TaxonomyAdminService } from "../services/taxonomy/taxonomy.admin.service";
import { type StatsController } from "../controllers/stats/stats.controller";
import { type ContestController } from "../controllers/contest/contest.controller";
import { type SolutionController } from "../controllers/solutions/solution.controller";
import { type ILeetCodeService } from "../services/stats/leetcode.service";

import { type ProblemCache } from "../cache/problems/problem.cache";
import { type ProblemTestCache } from "../cache/problems/problem-test.cache";
import { type AiJudgeCache } from "../cache/judge/ai-judge.cache";
import { SubmissionCache } from "../cache/submissions/submission.cache";
import { SolutionCache } from "../cache/solutions/solution.cache";
import { type AcademyCache } from "../cache/academy/academy.cache";
import { type SystemDesignCache } from "../cache/system-design/system-design.cache";
import { type CompanyCache } from "../cache/company/company.cache";

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
import { type UserController } from "../controllers/user/user.controller";
import { type CompilerController } from "../controllers/compiler/compiler.controller";
import { type TaxonomyController } from "../controllers/taxonomy/taxonomy.controller";
import { type TaxonomyAdminController } from "../controllers/taxonomy/taxonomy.admin.controller";
import { type WorkspaceController } from "../controllers/workspace/workspace.controller";
import { type WorkspaceService, type IWorkspaceService } from "../services/workspace/workspace.service";
import { type WorkspaceCache } from "../cache/workspace/workspace.cache";
import { type ChatController } from "../controllers/chat/chat.controller";
import { type ChatService, type IChatService } from "../services/chat/chat.service";
import { type DiagramResolverService, type IDiagramResolverService } from "../services/ai/diagram-resolver.service";
import { type GroqDiagramService, type IGroqDiagramService } from "../services/ai/groq-diagram.service";
import { type ChatRepository, type IChatRepository } from "../repositories/chat/chat.repository";
import { type IAcademyRepository } from "../repositories/academy/academy.repository";
import { type IAcademyAdminRepository } from "../repositories/academy/academy.admin.repository";
import { type IAcademyService, type AcademyService } from "../services/academy/academy.service";
import { type IAcademyAdminService } from "../services/academy/academy.admin.service";
import { type AcademyExecutionService } from "../services/academy/academy-execution.service";
import { type AcademyController } from "../controllers/academy/academy.controller";
import { type AcademyAdminController } from "../controllers/academy/academy.admin.controller";
import { type AcademyExecutionController } from "../controllers/academy/academy-execution.controller";
import { type ISystemDesignRepository } from "../repositories/system-design/system-design.repository";
import { type ISystemDesignAdminRepository } from "../repositories/system-design/system-design.admin.repository";
import { type ISystemDesignService } from "../services/system-design/system-design.service";
import { type ISystemDesignAdminService } from "../services/system-design/system-design.admin.service";
import { type SystemDesignController } from "../controllers/system-design/system-design.controller";
import { type SystemDesignAdminController } from "../controllers/system-design/system-design.admin.controller";
import { type ICompanyRepository } from "../repositories/company/company.repository";
import { type ICompanyService } from "../services/company/company.service";
import { type CompanyController } from "../controllers/company/company.controller";
import { type SeoRepository } from "../repositories/seo/seo.repository";
import { type SeoService } from "../services/seo/seo.service";
import { type SeoController } from "../controllers/seo/seo.controller";
import { type ReportBugRepository } from "../repositories/report-bug/report-bug.repository";
import { type IReportBugService } from "../services/report-bug/report-bug.service";
import { type ReportBugController } from "../controllers/report-bug/report-bug.controller";
import { type ICloudinaryService } from "../services/common/cloudinary.service";

// --- Infrastructure ---
import { submissionQueue, arenaCleanupQueue } from "./core/queue";

import { type StatsSubmissionService } from "../services/stats/stats-submission.service";
import { createClerkClient } from "@clerk/backend";
import { config } from "../configs/env";

/**
 * Type Definition for the DI Container Cradle.
 * This is the ultimate source of truth for dependencies across the platform.
 */
import { FollowRepository } from "../repositories/user/follow.repository";
import { type IFollowService } from "../services/user/follow.service";
import { FollowController } from "../controllers/user/follow.controller";
import { ProfileController } from "../controllers/user/profile.controller";
import { type IUserService } from "../services/user/user.service";
import { type ContestCache } from "../cache/contest/contest.cache";
import { type UserStatsCache } from "../cache/user/user-stats.cache";
import { type LeetCodeCache } from "../cache/user/leetcode.cache";
import { type LeaderboardCache } from "../cache/stats/leaderboard.cache";
import { type TaxonomyCache } from "../cache/taxonomy/taxonomy.cache";
import { GeminiLlmService } from "../services/ai/gemini-llm.service";
import { UnifiedLlmService } from "../services/ai/unified-llm.service";

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
  statsRepository: StatsRepository;
  contestRepository: ContestRepository;
  taxonomyRepository: TaxonomyRepository;
  taxonomyAdminRepository: TaxonomyAdminRepository;
  solutionRepository: SolutionRepository;
  workspaceRepository: WorkspaceRepository;
  chatRepository: IChatRepository;
  academyRepository: IAcademyRepository;
  academyAdminRepository: IAcademyAdminRepository;
  systemDesignRepository: ISystemDesignRepository;
  systemDesignAdminRepository: ISystemDesignAdminRepository;
  companyRepository: ICompanyRepository;
  seoRepository: SeoRepository;
  reportBugRepository: ReportBugRepository;

  // Services (Primary/Cached)
  authService: AuthService;
  problemService: ProblemService;
  problemTestService: ProblemTestService;
  submissionService: ISubmissionService;
  statsSubmissionService: StatsSubmissionService;
  statsService: IStatsService;
  groqLlmService: GroqLlmService;
  geminiLlmService: GeminiLlmService;
  unifiedLlmService: UnifiedLlmService;
  llm: GeminiLlmService;
  aiProblemService: AiProblemService;
  aiAddSolveService: AiAddSolveService;
  testcaseGeneratorService: TestcaseGeneratorService;
  arenaMatchService: ArenaMatchService;
  rawArenaMatchService: IArenaMatchService;
  arenaMatchCache: IArenaMatchService;
  arenaService: ArenaService;
  matchValidatorService: MatchValidatorService;
  problemValidatorService: ProblemValidatorService;
  aiCodeJudgeService: AiCodeJudgeService;
  aiVerdictAuditService: AiVerdictAuditService;
  driverJudgeExecutionService: DriverJudgeExecutionService;
  matchDomainEngine: MatchDomainEngine;
  matchBroadcaster: MatchBroadcasterService;
  judge0Service: Judge0Service;
  wandboxService: WandboxService;
  compilerService: CompilerService;
  clistService: ClistService;
  contestService: ContestService;
  taxonomyService: TaxonomyService;
  taxonomyAdminService: TaxonomyAdminService;
  solutionService: import("../services/solutions/solution.service").ISolutionService;
  workspaceService: IWorkspaceService;
  chatService: IChatService;
  diagramResolverService: IDiagramResolverService;
  groqDiagramService: IGroqDiagramService;
  leetcodeService: ILeetCodeService;
  academyService: IAcademyService;
  academyAdminService: IAcademyAdminService;
  academyExecutionService: AcademyExecutionService;
  academyAiJudgeService: import("../services/academy/academy-ai-judge.service").AcademyAiJudgeService;
  systemDesignService: ISystemDesignService;
  systemDesignAdminService: ISystemDesignAdminService;
  companyService: ICompanyService;
  seoService: SeoService;
  cloudinaryService: ICloudinaryService;
  reportBugService: IReportBugService;

  // Raw Services
  rawProblemService: ProblemService;
  rawProblemTestService: ProblemTestService;
  rawAiCodeJudgeService: AiCodeJudgeService;
  rawStatsService: IStatsService;
  rawLeetCodeService: ILeetCodeService;
  rawTaxonomyService: TaxonomyService;
  rawSubmissionService: SubmissionService;
  rawSolutionService: import("../services/solutions/solution.service").SolutionService;
  rawWorkspaceService: WorkspaceService;
  rawAcademyService: AcademyService;
  rawSystemDesignService: import("../services/system-design/system-design.service").SystemDesignService;
  rawCompanyService: import("../services/company/company.service").CompanyService;

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
  userStatsCache: UserStatsCache;
  contestCache: ContestCache;
  leetcodeCache: LeetCodeCache;
  taxonomyCache: TaxonomyCache;
  leaderboardCache: LeaderboardCache;
  submissionCache: SubmissionCache;
  solutionCache: SolutionCache;
  workspaceCache: WorkspaceCache;
  academyCache: AcademyCache;
  systemDesignCache: SystemDesignCache;
  companyCache: CompanyCache;

  // Controllers
  authController: AuthController;
  clerkWebhookController: ClerkWebhookController;
  problemController: ProblemController;
  problemTestController: ProblemTestController;
  submissionController: SubmissionController;
  aiProblemController: AiProblemController;
  arenaController: ArenaController;
  statsController: StatsController;
  userController: UserController;
  compilerController: CompilerController;
  contestController: ContestController;
  taxonomyController: TaxonomyController;
  taxonomyAdminController: TaxonomyAdminController;
  solutionController: SolutionController;
  workspaceController: WorkspaceController;
  chatController: ChatController;
  academyController: AcademyController;
  academyAdminController: AcademyAdminController;
  academyExecutionController: AcademyExecutionController;
  systemDesignController: SystemDesignController;
  systemDesignAdminController: SystemDesignAdminController;
  companyController: CompanyController;
  seoController: SeoController;
  reportBugController: ReportBugController;

  // Third Party
  clerkClient: ReturnType<typeof createClerkClient>;
  followRepository: FollowRepository;
  followService: IFollowService;
  followController: FollowController;
  profileController: ProfileController;
  userService: IUserService;
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

  // Third Party
  clerkClient: asValue(createClerkClient({ secretKey: config.clerkSecretKey })),
});

export { container };
export default container;
