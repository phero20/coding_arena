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
      logger.info("Attempting AI evaluation via Groq (Primary: llama-3.3-70b-versatile)");
      return await this.groqLlmService.generateJson<T>({ ...opts, model: "llama-3.3-70b-versatile" });
    } catch (err1: any) {
      logger.warn({ error: err1.message }, "Groq 70b failed. Falling back to Gemini (gemini-2.5-flash).");
      
      try {
        return await this.geminiLlmService.generateJson<T>({ ...opts, model: "gemini-2.5-flash" });
      } catch (err2: any) {
        logger.warn({ error: err2.message }, "Gemini 2.5 Flash failed. Falling back to Groq (llama-3.1-8b-instant).");

        try {
          return await this.groqLlmService.generateJson<T>({ ...opts, model: "llama-3.1-8b-instant" });
        } catch (err3: any) {
          logger.warn({ error: err3.message }, "Groq 8b failed. Falling back to Gemini (gemini-3.1-flash-lite).");

          try {
            return await this.geminiLlmService.generateJson<T>({ ...opts, model: "gemini-3.1-flash-lite" });
          } catch (err4: any) {
            logger.error({ error: err4.message }, "All 4 LLM fallback stages failed.");
            throw new Error("All primary and fallback AI evaluation services failed.");
          }
        }
      }
    }
  }
}
