import { asClass, asFunction } from "awilix";
import { type ICradle } from "../awilix-container";

// --- Services ---
import { AuthService } from "../../services/auth/auth.service";
import { ProblemService } from "../../services/problems/problem.service";
import { ProblemTestService } from "../../services/problems/problem-test.service";
import { SubmissionService } from "../../services/submissions/submission.service";
import { GroqLlmService } from "../../services/ai/groq-llm.service";
import { GeminiLlmService } from "../../services/ai/gemini-llm.service";
import { UnifiedLlmService } from "../../services/ai/unified-llm.service";
import { SystemClockService } from "../../services/common/clock.service";
import { AiProblemService } from "../../services/problems/ai-problem.service";
import { AiAddSolveService } from "../../services/problems/ai-addsolve.service";
import { ArenaService } from "../../services/arena/arena.service";
import { ArenaMatchService } from "../../services/arena/arena-match.service";
import { MatchValidatorService } from "../../services/arena/match-validator.service";
import { AiCodeJudgeService } from "../../services/judge/ai-code-judge.service";
import { AiVerdictAuditService } from "../../services/judge/ai-verdict-audit.service";
import { DriverJudgeExecutionService } from "../../services/judge/driver-judge-execution.service";
import { Judge0Service } from "../../services/judge/judge0.service";
import { WandboxService } from "../../services/judge/wandbox.service";
import { CompilerService } from "../../services/compiler/compiler.service";
import { ExecutionService } from "../../services/submissions/execution.service";
import { ProblemValidatorService } from "../../services/problems/problem-validator.service";
import { MatchDomainEngine } from "../../services/arena/match-domain-engine.service";
import { MatchBroadcasterService } from "../../services/arena/match-broadcaster.service";
import { StatsSubmissionService } from "../../services/stats/stats-submission.service";
import { StatsService } from "../../services/stats/stats.service";
import { FollowService } from "../../services/user/follow.service";
import { UserService } from "../../services/user/user.service";
import { ClistService } from "../../services/contest/clist.service";
import { ContestService } from "../../services/contest/contest.service";
import { LeetCodeService } from "../../services/stats/leetcode.service";
import { TaxonomyService } from "../../services/taxonomy/taxonomy.service";
import { SolutionService } from "../../services/solutions/solution.service";
import { WorkspaceService } from "../../services/workspace/workspace.service";
import { ChatService } from "../../services/chat/chat.service";
import { DiagramResolverService } from "../../services/ai/diagram-resolver.service";
import { GroqDiagramService } from "../../services/ai/groq-diagram.service";
import { AcademyService } from "../../services/academy/academy.service";
import { AcademyExecutionService } from "../../services/academy/academy-execution.service";
import { AcademyAiJudgeService } from "../../services/academy/academy-ai-judge.service";
import { SystemDesignService } from "../../services/system-design/system-design.service";
import { CompanyService } from "../../services/company/company.service";
import { SeoService } from "../../services/seo/seo.service";
import { CloudinaryService } from "../../services/common/cloudinary.service";
import { ReportBugService } from "../../services/report-bug/report-bug.service";
// --- Caches (Decorators) ---
import { ProblemCache } from "../../cache/problems/problem.cache";
import { ProblemTestCache } from "../../cache/problems/problem-test.cache";
import { AiJudgeCache } from "../../cache/judge/ai-judge.cache";
import { UserStatsCache } from "../../cache/user/user-stats.cache";
import { ArenaMatchCache } from "../../cache/arena/arena-match.cache";
import { ContestCache } from "../../cache/contest/contest.cache";
import { LeetCodeCache } from "../../cache/user/leetcode.cache";
import { TaxonomyCache } from "../../cache/taxonomy/taxonomy.cache";
import { LeaderboardCache } from "../../cache/stats/leaderboard.cache";
import { SubmissionCache } from "../../cache/submissions/submission.cache";
import { SolutionCache } from "../../cache/solutions/solution.cache";
import { WorkspaceCache } from "../../cache/workspace/workspace.cache";
import { AcademyCache } from "../../cache/academy/academy.cache";

/**
 * Service layer registrations.
 * This module manages the core business logic, AI judge engine, and caching decorators.
 */
export const servicesRegistry = {
  clockService: asClass(SystemClockService).singleton(),
  authService: asClass(AuthService).singleton(),
  groqLlmService: asClass(GroqLlmService).singleton(),
  geminiLlmService: asClass(GeminiLlmService).singleton(),
  unifiedLlmService: asClass(UnifiedLlmService).singleton(),

  // Gemini is now the primary LLM for high accuracy
  llm: asFunction(({ geminiLlmService }: ICradle) => geminiLlmService).singleton(),

  // Raw services for cache decoration
  rawProblemService: asClass(ProblemService).singleton(),
  rawProblemTestService: asClass(ProblemTestService).singleton(),
  rawAiCodeJudgeService: asClass(AiCodeJudgeService).singleton(),
  rawStatsService: asClass(StatsService).singleton(),
  rawArenaMatchService: asClass(ArenaMatchService).singleton(),
  rawLeetCodeService: asClass(LeetCodeService).singleton(),
  rawTaxonomyService: asClass(TaxonomyService).singleton(),
  rawSubmissionService: asClass(SubmissionService).singleton(),
  rawSolutionService: asClass(SolutionService).singleton(),
  rawWorkspaceService: asClass(WorkspaceService).singleton(),
  rawAcademyService: asClass(AcademyService).singleton(),
  chatService: asClass(ChatService).singleton(),
  diagramResolverService: asClass(DiagramResolverService).singleton(),
  groqDiagramService: asClass(GroqDiagramService).singleton(),

  arenaService: asClass(ArenaService).singleton(),
  matchValidatorService: asClass(MatchValidatorService).singleton(),
  problemValidatorService: asClass(ProblemValidatorService).singleton(),
  matchDomainEngine: asClass(MatchDomainEngine).singleton(),
  matchBroadcaster: asClass(MatchBroadcasterService).singleton(),
  executionService: asClass(ExecutionService).singleton(),
  aiVerdictAuditService: asClass(AiVerdictAuditService).singleton(),
  driverJudgeExecutionService: asClass(DriverJudgeExecutionService).singleton(),
  judge0Service: asClass(Judge0Service).singleton(),
  wandboxService: asClass(WandboxService).singleton(),
  compilerService: asClass(CompilerService).singleton(),
  aiProblemService: asClass(AiProblemService).singleton(),
  aiAddSolveService: asClass(AiAddSolveService).singleton(),

  // Caches/Decorators
  problemCache: asClass(ProblemCache).singleton(),
  problemTestCache: asClass(ProblemTestCache).singleton(),
  aiJudgeCache: asClass(AiJudgeCache).singleton(),
  userStatsCache: asClass(UserStatsCache).singleton(),
  arenaMatchCache: asClass(ArenaMatchCache).singleton(),
  contestCache: asClass(ContestCache).singleton(),
  leetcodeCache: asClass(LeetCodeCache).singleton(),
  taxonomyCache: asClass(TaxonomyCache).singleton(),
  leaderboardCache: asClass(LeaderboardCache).singleton(),
  submissionCache: asClass(SubmissionCache).singleton(),
  solutionCache: asClass(SolutionCache).singleton(),
  workspaceCache: asClass(WorkspaceCache).singleton(),
  academyCache: asClass(AcademyCache).singleton(),

  // Primary service endpoints (pointing to caches)
  problemService: asFunction(
    ({ problemCache }: ICradle) => problemCache,
  ).singleton(),
  problemTestService: asFunction(
    ({ problemTestCache }: ICradle) => problemTestCache,
  ).singleton(),
  aiCodeJudgeService: asFunction(
    ({ aiJudgeCache }: ICradle) => aiJudgeCache,
  ).singleton(),
  statsSubmissionService: asClass(StatsSubmissionService).singleton(),
  statsService: asFunction(
    ({ userStatsCache }: ICradle) => userStatsCache,
  ).singleton(),
  leetcodeService: asFunction(
    ({ leetcodeCache }: ICradle) => leetcodeCache,
  ).singleton(),
  followService: asClass(FollowService).singleton(),
  arenaMatchService: asFunction(
    ({ arenaMatchCache }: ICradle) => arenaMatchCache,
  ).singleton(),

  userService: asClass(UserService).singleton(),
  clistService: asClass(ClistService).singleton(),
  contestService: asClass(ContestService).singleton(),
  workspaceService: asFunction(
    ({ workspaceCache }: ICradle) => workspaceCache,
  ).singleton(),
  
  taxonomyService: asFunction(
    ({ taxonomyCache }: ICradle) => taxonomyCache,
  ).singleton(),
  submissionService: asFunction(
    ({ submissionCache }: ICradle) => submissionCache,
  ).singleton(),
  solutionService: asFunction(
    ({ solutionCache }: ICradle) => solutionCache,
  ).singleton(),
  academyService: asFunction(
    ({ academyCache }: ICradle) => academyCache,
  ).singleton(),
  academyExecutionService: asClass(AcademyExecutionService).singleton(),
  academyAiJudgeService: asClass(AcademyAiJudgeService).singleton(),
  systemDesignService: asClass(SystemDesignService).singleton(),
  companyService: asClass(CompanyService).singleton(),
  seoService: asClass(SeoService).singleton(),
  cloudinaryService: asClass(CloudinaryService).singleton(),
  reportBugService: asClass(ReportBugService).singleton(),
};
