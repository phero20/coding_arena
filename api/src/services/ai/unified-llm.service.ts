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
}

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
    try {
      logger.info("Attempting AI evaluation via Gemini (Primary: gemini-2.5-flash)");
      return await this.geminiLlmService.generateJson<T>({ ...opts, model: "gemini-2.5-flash" });
    } catch (err1: any) {
      logger.warn({ error: err1.message }, "Gemini 2.5 Flash failed. Falling back to Groq (llama-3.3-70b-versatile).");
      
      try {
        return await this.groqLlmService.generateJson<T>({ ...opts, model: "llama-3.3-70b-versatile" });
      } catch (err2: any) {
        logger.warn({ error: err2.message }, "Groq 70b failed. Falling back to Gemini (gemini-1.5-flash-8b).");

        try {
          return await this.geminiLlmService.generateJson<T>({ ...opts, model: "gemini-1.5-flash-8b" });
        } catch (err3: any) {
          logger.warn({ error: err3.message }, "Gemini 1.5 Flash 8B failed. Falling back to Groq (llama-3.1-8b-instant).");

          try {
            return await this.groqLlmService.generateJson<T>({ ...opts, model: "llama-3.1-8b-instant" });
          } catch (err4: any) {
            logger.error({ error: err4.message }, "All 4 LLM fallback stages failed.");
            throw new Error("All primary and fallback AI evaluation services failed.");
          }
        }
      }
    }
  }
}
