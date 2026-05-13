import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { config } from "../../configs/env";
import { metrics } from "../../libs/core/metrics";
import { logger } from "../../libs/utils/logger";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../common/clock.service";

export interface GeminiJsonResponse<T> {
  data: T;
  raw: any;
}

export class GeminiLlmService {
  private readonly clock: IClockService;
  private readonly genAI: GoogleGenerativeAI;
  private readonly primaryModel = "gemini-2.0-flash";
  private readonly fallbackModel = "gemini-flash-latest";

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
    if (!config.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  /**
   * Calls Gemini via official SDK with fallback logic.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<GeminiJsonResponse<T>> {
    try {
      return await this._executeRequest<T>(this.primaryModel, opts);
    } catch (err: any) {
      const isQuotaError = err.message?.includes("429") || err.message?.includes("Quota exceeded");
      if (isQuotaError) {
        logger.warn({ error: err.message }, `Gemini 2.0 Flash quota exceeded. Falling back to ${this.fallbackModel}...`);
        return await this._executeRequest<T>(this.fallbackModel, opts);
      }
      throw err;
    }
  }

  private async _executeRequest<T>(
    modelName: string,
    opts: {
      systemPrompt: string;
      userPrompt: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<GeminiJsonResponse<T>> {
    const model = this.genAI.getGenerativeModel(
      {
        model: modelName,
        systemInstruction: opts.systemPrompt,
      },
      { apiVersion: "v1beta" },
    );

    const startTime = this.clock.now();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0,
        maxOutputTokens: opts.maxTokens ?? 8192,
        responseMimeType: "application/json",
      },
    });

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
      const quoteCount = (cleaned.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        cleaned += '"'; 
      }

      cleaned = cleaned.replace(/,\s*([}\]])/g, "$1"); 
      cleaned = cleaned.replace(/,\s*$/g, ""); 

      // 4. Extract JSON part (First '{' to last possible closing)
      const firstBrace = cleaned.indexOf("{");
      if (firstBrace !== -1) {
        cleaned = cleaned.substring(firstBrace);

        let braceStack = 0;
        let bracketStack = 0;
        let inString = false;

        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i];
          if (char === '"' && (i === 0 || cleaned[i - 1] !== "\\")) inString = !inString;
          if (!inString) {
            if (char === "{") braceStack++;
            if (char === "}") braceStack--;
            if (char === "[") bracketStack++;
            if (char === "]") bracketStack--;
          }
        }

        if (braceStack > 0 && braceStack < 20) cleaned += "}".repeat(braceStack);
        if (bracketStack > 0 && bracketStack < 20) cleaned += "]".repeat(bracketStack);
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