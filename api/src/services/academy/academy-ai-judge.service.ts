import { type ICradle } from "../../libs/awilix-container";
import { type UnifiedLlmService } from "../ai/unified-llm.service";
import { buildAcademyAiJudgeSystemPrompt, buildAcademyAiJudgeUserPrompt } from "../../libs/prompts/academy-ai-judge.prompt";

export interface AcademyExecutionResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  compileError: string | null;
  failures: Array<{
    name: string;
    message: string;
  }>;
  rawOutput: string;
  isRawExecution: boolean;
  isAiEvaluation?: boolean;
}

export interface AiJudgeEvaluationParams {
  trackSlug: string;
  userCode: string;
  testCode: string;
  instructions: string;
}

export class AcademyAiJudgeService {
  private readonly unifiedLlmService: UnifiedLlmService;

  constructor(cradle: ICradle) {
    this.unifiedLlmService = cradle.unifiedLlmService;
  }

  async evaluate(params: AiJudgeEvaluationParams): Promise<AcademyExecutionResult> {
    const { trackSlug, userCode, testCode, instructions } = params;

    const systemPrompt = buildAcademyAiJudgeSystemPrompt(trackSlug);

    const userPrompt = buildAcademyAiJudgeUserPrompt(instructions, userCode, testCode);

    const result = await this.unifiedLlmService.generateJson<Omit<AcademyExecutionResult, "isRawExecution" | "isAiEvaluation">>({
      systemPrompt,
      userPrompt,
      temperature: 0,
    });

    return {
      ...result.data,
      isRawExecution: false,
      isAiEvaluation: true,
    };
  }
}
