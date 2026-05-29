import { type ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { type GeminiLlmService } from "../ai/gemini-llm.service";
import { type GroqLlmService } from "../ai/groq-llm.service";

const logger = createLogger("academy-ai-judge.service");

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
  private readonly geminiLlmService: GeminiLlmService;
  private readonly groqLlmService: GroqLlmService;

  constructor(cradle: ICradle) {
    this.geminiLlmService = cradle.geminiLlmService;
    this.groqLlmService = cradle.groqLlmService;
  }

  async evaluate(params: AiJudgeEvaluationParams): Promise<AcademyExecutionResult> {
    const { trackSlug, userCode, testCode, instructions } = params;

    const systemPrompt = `You are a strict code compiler and test runner evaluating a student's solution against a test suite.
Your task is to analyze the user's code, the provided test suite, and the original problem instructions to determine if the user's code correctly passes the tests.

Language: ${trackSlug}

If the user's code has blatant syntax errors, set compileError to a descriptive error message, set passed to false, and totalTests to 0.
If the code is syntactically valid but fails specific logic required by the tests or instructions, set passed to false, calculate the number of failed tests, and populate the failures array with details.
If the code correctly implements the logic and would pass all tests, set passed to true.

Output your response STRICTLY as a JSON object matching this schema exactly:
{
  "passed": boolean,
  "totalTests": number,
  "passedTests": number,
  "failedTests": number,
  "compileError": string | null,
  "failures": [
    {
      "name": "string (name of the failing test or condition)",
      "message": "string (why it failed)"
    }
  ],
  "rawOutput": "string (a brief summary of the execution as if printed to a console)"
}`;

    const userPrompt = `### Problem Instructions:
${instructions}

### User Solution Code:
\`\`\`
${userCode}
\`\`\`

### Test Suite:
\`\`\`
${testCode}
\`\`\`

Evaluate the user's solution against the test suite and instructions. Return ONLY valid JSON.`;

    try {
      logger.info({ trackSlug }, "Attempting AI evaluation via Groq");
      const result = await this.groqLlmService.generateJson<Omit<AcademyExecutionResult, "isRawExecution" | "isAiEvaluation">>({
        systemPrompt,
        userPrompt,
        temperature: 0,
      });

      return {
        ...result.data,
        isRawExecution: false,
        isAiEvaluation: true,
      };
    } catch (error: any) {
      logger.warn({ error: error.message }, "Groq evaluation failed. Falling back to Gemini.");

      try {
        const fallbackResult = await this.geminiLlmService.generateJson<Omit<AcademyExecutionResult, "isRawExecution" | "isAiEvaluation">>({
          systemPrompt,
          userPrompt,
          temperature: 0,
        });

        return {
          ...fallbackResult.data,
          isRawExecution: false,
          isAiEvaluation: true,
        };
      } catch (fallbackError: any) {
        logger.error({ error: fallbackError.message }, "Gemini fallback evaluation also failed.");
        throw new Error("Both primary and fallback AI evaluation services failed.");
      }
    }
  }
}
