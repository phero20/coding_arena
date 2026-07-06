import { type ICradle } from "../../libs/awilix-container";
import { type ILlmService } from "./llm.service";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("unified-llm.service");

export interface UnifiedJsonResponse<T> {
  data: T;
  raw: unknown;
}

export interface GenerateJsonOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  model?: string;
  maxTokens?: number;
  order?: "order1" | "order2";
}

interface LlmStep {
  provider: "groq" | "gemini";
  model: string;
}

const ORDER1: LlmStep[] = [
  { provider: "groq", model: "llama-3.3-70b-versatile" },
  // { provider: "groq", model: "openai/gpt-oss-120b" },

  { provider: "gemini", model: "gemini-3.1-flash-lite" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "gemini", model: "gemini-2.5-flash-lite" },
  { provider: "gemini", model: "gemini-3-flash-preview" },
  { provider: "groq", model: "llama-3.1-8b-instant" },
];


const ORDER2: LlmStep[] = [
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "groq", model: "llama-3.3-70b-versatile" },
  // { provider: "groq", model: "openai/gpt-oss-120b" },
  { provider: "gemini", model: "gemini-3.1-flash-lite" },
  { provider: "gemini", model: "gemini-2.5-flash-lite" },
  { provider: "gemini", model: "gemini-3-flash-preview" },
  { provider: "groq", model: "llama-3.1-8b-instant" },
];

/**
 * Unified LLM Gateway Service
 *
 * Provides a resilient, centralized interface for generating structured JSON responses
 * from LLMs. Attempts Groq first for speed, and transparently falls back to Gemini
 * upon failure or rate limiting.
 */
export class UnifiedLlmService {
  private readonly llmService: ILlmService;

  constructor(cradle: ICradle) {
    this.llmService = cradle.llmService;
  }

  async generateJson<T>(
    opts: GenerateJsonOptions,
  ): Promise<UnifiedJsonResponse<T>> {
    const order = opts.order || "order1";
    const steps = order === "order2" ? ORDER2 : ORDER1;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      try {
        if (i === 0) {
          logger.info(
            `Attempting AI evaluation via ${step.provider.charAt(0).toUpperCase() + step.provider.slice(1)} (Primary: ${step.model})`,
          );
        }

        return await this.llmService.generateJson<T>({
          ...opts,
          model: step.model,
        });
      } catch (err: any) {
        if (i < steps.length - 1) {
          const nextStep = steps[i + 1];
          logger.warn(
            { error: err.message },
            `${step.provider.charAt(0).toUpperCase() + step.provider.slice(1)} ${step.model} failed. Falling back to ${nextStep.provider.charAt(0).toUpperCase() + nextStep.provider.slice(1)} (${nextStep.model}).`,
          );
        } else {
          logger.error(
            { error: err.message },
            `All ${steps.length} LLM fallback stages failed.`,
          );
        }
      }
    }

    throw new Error("All primary and fallback AI evaluation services failed.");
  }
}
