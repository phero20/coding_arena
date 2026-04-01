import { problemService, problemTestService, groqLlmService, submissionService } from "./service.container";
import { problemTestRepository } from "./repo.container";
import { ProblemCache } from "../../cache/problem.cache";
import { ProblemTestCache } from "../../cache/problem-test.cache";
import { AiJudgeCache } from "../../cache/ai-judge.cache";
import { AiCodeJudgeService } from "../../services/ai-code-judge.service";
import { SubmissionEvaluator } from "../../workers/submission/evaluator";
import { ExecutionService } from "../../services/execution.service";

// --- Caches ---
export const problemCache = new ProblemCache(problemService);
export const problemTestCache = new ProblemTestCache(problemTestService);

// --- Specialized Internal Services ---
export const aiCodeJudgeService = new AiCodeJudgeService(
  groqLlmService,
  problemCache
);
export const aiJudgeCache = new AiJudgeCache(aiCodeJudgeService);

export const submissionEvaluator = new SubmissionEvaluator(
  problemTestRepository,
  aiJudgeCache
);

export const executionService = new ExecutionService(
  problemTestCache,
  aiJudgeCache,
  submissionService
);
