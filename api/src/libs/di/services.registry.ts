import { asClass, asFunction } from "awilix";
import { type ICradle } from "../awilix-container";

// --- Services ---
import { AuthService } from "../../services/auth/auth.service";
import { ProblemService } from "../../services/problems/problem.service";
import { ProblemTestService } from "../../services/problems/problem-test.service";
import { SubmissionService } from "../../services/submissions/submission.service";
import { GroqLlmService } from "../../services/ai/groq-llm.service";
import { SystemClockService } from "../../services/common/clock.service";
import { AiProblemService } from "../../services/problems/ai-problem.service";
import { ArenaService } from "../../services/arena/arena.service";
import { ArenaMatchService } from "../../services/arena/arena-match.service";
import { MatchValidatorService } from "../../services/arena/match-validator.service";
import { AiCodeJudgeService } from "../../services/judge/ai-code-judge.service";
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

// --- Caches (Decorators) ---
import { ProblemCache } from "../../cache/problems/problem.cache";
import { ProblemTestCache } from "../../cache/problems/problem-test.cache";
import { AiJudgeCache } from "../../cache/judge/ai-judge.cache";
import { UserStatsCache } from "../../cache/user/user-stats.cache";
import { ArenaMatchCache } from "../../cache/arena/arena-match.cache";
import { ContestCache } from "../../cache/contest/contest.cache";
import { LeetCodeCache } from "../../cache/user/leetcode.cache";

/**
 * Service layer registrations.
 * This module manages the core business logic, AI judge engine, and caching decorators.
 */
export const servicesRegistry = {
  clockService: asClass(SystemClockService).singleton(),
  authService: asClass(AuthService).singleton(),
  submissionService: asClass(SubmissionService).singleton(),
  groqLlmService: asClass(GroqLlmService).singleton(),

  // Legacy Alias
  llm: asFunction(({ groqLlmService }: ICradle) => groqLlmService).singleton(),

  // Raw services for cache decoration
  rawProblemService: asClass(ProblemService).singleton(),
  rawProblemTestService: asClass(ProblemTestService).singleton(),
  rawAiCodeJudgeService: asClass(AiCodeJudgeService).singleton(),
  rawStatsService: asClass(StatsService).singleton(),
  rawArenaMatchService: asClass(ArenaMatchService).singleton(),
  rawLeetCodeService: asClass(LeetCodeService).singleton(),

  arenaService: asClass(ArenaService).singleton(),
  matchValidatorService: asClass(MatchValidatorService).singleton(),
  problemValidatorService: asClass(ProblemValidatorService).singleton(),
  matchDomainEngine: asClass(MatchDomainEngine).singleton(),
  matchBroadcaster: asClass(MatchBroadcasterService).singleton(),
  executionService: asClass(ExecutionService).singleton(),
  judge0Service: asClass(Judge0Service).singleton(),
  wandboxService: asClass(WandboxService).singleton(),
  compilerService: asClass(CompilerService).singleton(),
  aiProblemService: asClass(AiProblemService).singleton(),

  // Caches/Decorators
  problemCache: asClass(ProblemCache).singleton(),
  problemTestCache: asClass(ProblemTestCache).singleton(),
  aiJudgeCache: asClass(AiJudgeCache).singleton(),
  userStatsCache: asClass(UserStatsCache).singleton(),
  arenaMatchCache: asClass(ArenaMatchCache).singleton(),
  contestCache: asClass(ContestCache).singleton(),
  leetcodeCache: asClass(LeetCodeCache).singleton(),

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
};
