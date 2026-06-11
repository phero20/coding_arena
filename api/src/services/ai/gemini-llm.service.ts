import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { config } from "../../configs/env";
import { metrics } from "../../libs/core/metrics";
import { logger } from "../../libs/utils/logger";
import { CircuitBreaker } from "../../libs/circuit-breaker";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../common/clock.service";

export interface GeminiJsonResponse<T> {
  data: T;
  raw: any;
}

export class GeminiLlmService {
  private readonly clock: IClockService;
  private readonly apiKeys: string[];
  private readonly genAIs: GoogleGenerativeAI[];
  
  private circuitBreaker = new CircuitBreaker("Gemini API", 3, 1, 60000);

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
    this.apiKeys = config.geminiApiKeys || [];
    if (this.apiKeys.length === 0) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.genAIs = this.apiKeys.map(key => new GoogleGenerativeAI(key));
  }

  /**
   * Calls Gemini via official SDK with fallback logic.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    responseSchema?: Schema;
    model?: string;
  }): Promise<GeminiJsonResponse<T>> {
    if (!opts.model) {
      throw new Error("Gemini model must be explicitly provided in opts.model");
    }
    return await this._executeRequest<T>(opts.model, opts);
  }

  private async _executeRequest<T>(
    modelName: string,
    opts: {
      systemPrompt: string;
      userPrompt: string;
      temperature?: number;
      maxTokens?: number;
      responseSchema?: Schema;
    },
    keyIndex: number = 0
  ): Promise<GeminiJsonResponse<T>> {
    if (keyIndex >= this.genAIs.length) {
      throw new Error(`All ${this.genAIs.length} Gemini API keys failed (exhausted).`);
    }

    const genAI = this.genAIs[keyIndex];
    const model = genAI.getGenerativeModel(
      {
        model: modelName,
        systemInstruction: opts.systemPrompt,
      },
      { apiVersion: "v1beta", timeout: 120000 },
    );

    const startTime = this.clock.now();

    let result;
    try {
      result = await this.circuitBreaker.execute(() => model.generateContent({
        contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
        generationConfig: {
          temperature: opts.temperature ?? 0,
          maxOutputTokens: opts.maxTokens ?? 8192,
          responseMimeType: "application/json",
          ...(opts.responseSchema && { responseSchema: opts.responseSchema }),
        },
      }));
    } catch (err: any) {
      const isQuotaError = err.message?.includes("429") || err.message?.includes("Quota exceeded");
      const isAuthError = err.message?.includes("401") || err.message?.includes("API key not valid");
      const isServerError = err.message?.includes("503") || err.status === 503 || err.cause?.status === 503;

      if (isQuotaError || isAuthError || isServerError) {
        logger.warn({ error: err.message, keyIndex }, `Gemini API key at index ${keyIndex} failed. Rotating to next key...`);
        return await this._executeRequest<T>(modelName, opts, keyIndex + 1);
      }
      throw err;
    }

    const duration = this.clock.now() - startTime;
    metrics.recordLlmLatency(duration);

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("Gemini response did not contain any content");
    }

    try {
      // 1. Strip Markdown code blocks if present
      let cleaned = content.replace(/^```json\n?|```$/g, "").trim();

      // 2. Hallucination Guard: Detect repeating bracket garbage
      if (/(\{ *\} *){5,}/.test(cleaned) || /(\{ *){10,}/.test(cleaned)) {
         throw new Error("Gemini returned repeating bracket garbage (hallucination)");
      }

      // 3. Advanced JSON Repair for Truncated Responses
      // Strip escaped quotes to correctly count structural quotes
      const unescapedQuotes = (cleaned.replace(/\\"/g, "").match(/"/g) || []).length;
      if (unescapedQuotes % 2 !== 0) {
        cleaned += '"'; 
      }

      cleaned = cleaned.replace(/,\s*([}\]])/g, "$1"); 
      cleaned = cleaned.replace(/,\s*$/g, ""); 
      
      // Fix unescaped backslashes (common in LaTeX formulas)
      // Matches a backslash not followed by valid JSON escape chars, ensuring it's not already escaped
      cleaned = cleaned.replace(/(?<!\\)\\([^"\\/bfnrtu])/g, "\\\\$1"); 

      // 4. Extract JSON part (First '{' to last possible closing)
      const firstBrace = cleaned.indexOf("{");
      if (firstBrace !== -1) {
        cleaned = cleaned.substring(firstBrace);

        let braceStack = 0;
        let inString = false;
        let endIdx = -1;
        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i];
          if (char === '"') {
            let backslashCount = 0;
            let j = i - 1;
            while (j >= 0 && cleaned[j] === "\\") {
              backslashCount++;
              j--;
            }
            if (backslashCount % 2 === 0) inString = !inString;
          }
          if (!inString) {
            if (char === "{") braceStack++;
            if (char === "}") braceStack--;
          }
          if (braceStack === 0) {
            endIdx = i;
            break;
          }
        }

        if (endIdx !== -1) {
          // Perfectly balanced JSON found, ignore any trailing garbage
          cleaned = cleaned.substring(0, endIdx + 1);
        } else if (braceStack > 0 && braceStack < 20) {
          // It was truncated, auto-close it
          cleaned += "}".repeat(braceStack);
        }
      }

      const parsed = JSON.parse(cleaned) as T;
      return {
        data: parsed,
        raw: result,
      };
    } catch (err) {
      logger.error({ content, model: modelName }, "CRITICAL: Gemini returned invalid JSON");
      throw new Error(`Gemini (${modelName}) returned invalid JSON: ${(err as any).message}`);
    }
  }
}


// - models/gemini-2.5-flash
// - models/gemini-2.5-pro
// - models/gemini-2.0-flash
// - models/gemini-2.0-flash-001
// - models/gemini-2.0-flash-lite-001
// - models/gemini-2.0-flash-lite
// - models/gemini-2.5-flash-preview-tts
// - models/gemini-2.5-pro-preview-tts
// - models/gemma-4-26b-a4b-it
// - models/gemma-4-31b-it
// - models/gemini-flash-latest
// - models/gemini-flash-lite-latest
// - models/gemini-pro-latest
// - models/gemini-2.5-flash-lite
// - models/gemini-2.5-flash-image
// - models/gemini-3-pro-preview
// - models/gemini-3-flash-preview
// - models/gemini-3.1-pro-preview
// - models/gemini-3.1-pro-preview-customtools
// - models/gemini-3.1-flash-lite-preview
// - models/gemini-3.1-flash-lite
// - models/gemini-3-pro-image-preview
// - models/nano-banana-pro-preview
// - models/gemini-3.1-flash-image-preview
// - models/lyria-3-clip-preview
// - models/lyria-3-pro-preview
// - models/gemini-3.1-flash-tts-preview
// - models/gemini-robotics-er-1.5-preview
// - models/gemini-robotics-er-1.6-preview
// - models/gemini-2.5-computer-use-preview-10-2025
// - models/deep-research-max-preview-04-2026
// - models/deep-research-preview-04-2026
// - models/deep-research-pro-preview-12-2025
// - models/gemini-embedding-001
// - models/gemini-embedding-2-preview
// - models/gemini-embedding-2
// - models/aqa
// - models/imagen-4.0-generate-001
// - models/imagen-4.0-ultra-generate-001
// - models/imagen-4.0-fast-generate-001
// - models/veo-2.0-generate-001
// - models/veo-3.0-generate-001
// - models/veo-3.0-fast-generate-001
// - models/veo-3.1-generate-preview
// - models/veo-3.1-fast-generate-preview
// - models/veo-3.1-lite-generate-preview
// - models/gemini-2.5-flash-native-audio-latest
// - models/gemini-2.5-flash-native-audio-preview-09-2025
// - models/gemini-2.5-flash-native-audio-preview-12-2025
// - models/gemini-3.1-flash-live-preview