import type { IProblemService } from "../problems/problem.service";
import type { UnifiedJsonResponse } from "../ai/unified-llm.service";
import { type UnifiedLlmService } from "../ai/unified-llm.service";
import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type {
  ExecutionTestResult,
  ExecutionVerdict,
} from "../../libs/utils/verdict.util";
import { getLanguageName } from "../../libs/utils/languages";
import { sanitizeDescriptionForAi, SANITIZE_PROFILES } from "../../libs/security/prompt-sanitizer";
import { AI_CODE_JUDGE_SYSTEM_PROMPT, buildAiCodeJudgeUserPrompt } from "../../libs/prompts/ai-code-judge.prompt";

export interface AiRunSamplesInput {
  problemId: string;
  languageId: string;
  languageName: string;
  sourceCode: string;
  tests: {
    index: number;
    input: string;
    expected_output: string;
  }[];
}

interface AiTestVerdict {
  index: number;
  verdict: ExecutionVerdict;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
}

interface AiRunSamplesOutput {
  tests: AiTestVerdict[];
}

export interface IAiJudgeService {
  runSamples(input: AiRunSamplesInput): Promise<AiRunSamplesResult>;
}

export interface AiRunSamplesResult {
  overallStatus: SubmissionStatus;
  tests: ExecutionTestResult[];
  compileOutput?: string;
  rawLlmResponse: UnifiedJsonResponse<AiRunSamplesOutput>["raw"];
  cached?: boolean;
}

const verdictToStatusId: Record<
  ExecutionVerdict,
  { id: number; description: string }
> = {
  ACCEPTED: { id: 3, description: "Accepted" },
  WRONG_ANSWER: { id: 4, description: "Wrong Answer" },
  TLE: { id: 5, description: "Time Limit Exceeded" },
  COMPILATION_ERROR: { id: 6, description: "Compilation Error" },
  RUNTIME_ERROR: { id: 7, description: "Runtime Error (SIGSEGV)" },
  SYSTEM_ERROR: { id: 13, description: "Internal Error" },
};

import { type ICradle } from "../../libs/awilix-container";

/**
 * AI-based code judge used as a temporary backend for execution,
 * returning results in the same shape that the real Judge0-based
 * execution service uses.
 */
export class AiCodeJudgeService implements IAiJudgeService {
  private readonly unifiedLlmService: UnifiedLlmService;
  private readonly problemService: IProblemService;

  constructor({ unifiedLlmService, problemService }: ICradle) {
    this.unifiedLlmService = unifiedLlmService;
    this.problemService = problemService;
  }

  async runSamples(input: AiRunSamplesInput): Promise<AiRunSamplesResult> {
    const problem = await this.problemService.getProblemById(input.problemId);

    const systemPrompt = AI_CODE_JUDGE_SYSTEM_PROMPT;

    const userPrompt = buildAiCodeJudgeUserPrompt({
      languageName: input.languageName,
      languageId: input.languageId,
      problem: problem ? {
        title: problem.title,
        description: sanitizeDescriptionForAi(problem.description, SANITIZE_PROFILES.STRICT),
        multiAnswer: problem.judging_policy?.multi_answer === true
      } : undefined,
      tests: input.tests,
      sourceCode: input.sourceCode
    });

    const { data, raw } = await this.unifiedLlmService.generateJson<AiRunSamplesOutput>({
      systemPrompt,
      userPrompt,
      temperature: 0,
    });

    if (!Array.isArray(data.tests)) {
      throw new Error("AI execution response did not include tests array");
    }

    const tests: ExecutionTestResult[] = input.tests.map((t) => {
      const aiVerdict = data.tests.find((v) => v.index === t.index);
      const verdict: ExecutionVerdict = aiVerdict?.verdict ?? "SYSTEM_ERROR";
      const rawStatus = verdictToStatusId[verdict];

      return {
        index: t.index,
        input: t.input,
        expected_output: t.expected_output,
        stdout: aiVerdict?.stdout ?? null,
        stderr: aiVerdict?.stderr ?? null,
        compile_output: aiVerdict?.compile_output ?? null,
        message: aiVerdict?.message ?? null,
        status: verdict,
        rawStatus,
        time: null,
        memory: null,
      };
    });

    const firstFailedTest = tests.find((t) => t.status !== "ACCEPTED");
    const overallStatus: SubmissionStatus = firstFailedTest
      ? firstFailedTest.status
      : "ACCEPTED";

    return {
      overallStatus,
      tests,
      rawLlmResponse: raw,
    };
  }
}


