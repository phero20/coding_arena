import { type ICradle } from "../../libs/awilix-container";
import { type GroqLlmService } from "./groq-llm.service";
import { type GeminiLlmService } from "./gemini-llm.service";
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
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "groq", model: "llama-3.1-8b-instant" },
  { provider: "gemini", model: "gemini-1.5-flash-8b" }
];

const ORDER2: LlmStep[] = [
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "groq", model: "llama-3.3-70b-versatile" },
  { provider: "gemini", model: "gemini-1.5-flash-8b" },
  { provider: "groq", model: "llama-3.1-8b-instant" }
];

/**
 * Unified LLM Gateway Service
 * 
 * Provides a resilient, centralized interface for generating structured JSON responses 
 * from LLMs. Attempts Groq first for speed, and transparently falls back to Gemini 
 * upon failure or rate limiting.
 */
export class UnifiedLlmService {
  private readonly groqLlmService: GroqLlmService;
  private readonly geminiLlmService: GeminiLlmService;

  constructor(cradle: ICradle) {
    this.groqLlmService = cradle.groqLlmService;
    this.geminiLlmService = cradle.geminiLlmService;
  }

  async generateJson<T>(opts: GenerateJsonOptions): Promise<UnifiedJsonResponse<T>> {
    const order = opts.order || "order1";
    const steps = order === "order2" ? ORDER2 : ORDER1;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      try {
        if (i === 0) {
          logger.info(`Attempting AI evaluation via ${step.provider === "groq" ? "Groq" : "Gemini"} (Primary: ${step.model})`);
        }
        
        if (step.provider === "groq") {
          return await this.groqLlmService.generateJson<T>({ ...opts, model: step.model });
        } else {
          return await this.geminiLlmService.generateJson<T>({ ...opts, model: step.model });
        }
      } catch (err: any) {
        if (i < steps.length - 1) {
          const nextStep = steps[i + 1];
          logger.warn({ error: err.message }, `${step.provider === "groq" ? "Groq" : "Gemini"} ${step.model} failed. Falling back to ${nextStep.provider === "groq" ? "Groq" : "Gemini"} (${nextStep.model}).`);
        } else {
          logger.error({ error: err.message }, `All ${steps.length} LLM fallback stages failed.`);
        }
      }
    }

    throw new Error("All primary and fallback AI evaluation services failed.");
  }
}
