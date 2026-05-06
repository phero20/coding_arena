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
  private readonly model = "gemini-3.1-flash-lite-preview";

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
    if (!config.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  /**
   * Calls Gemini via official SDK.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<GeminiJsonResponse<T>> {
    const model = this.genAI.getGenerativeModel(
      {
        model: this.model,
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

      // 2. Advanced JSON Repair for Truncated Responses
      // Check if the last character is inside a string
      const quoteCount = (cleaned.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        cleaned += '"'; // Close the hanging string
      }

      // Remove trailing commas which break JSON.parse
      cleaned = cleaned.replace(/,\s*([}\]])/g, "$1"); // case: {"a": 1, } -> {"a": 1}
      cleaned = cleaned.replace(/,\s*$/g, ""); // case: {"a": 1, -> {"a": 1

      // 3. Extract JSON part (First '{' to last possible closing)
      const firstBrace = cleaned.indexOf("{");
      if (firstBrace !== -1) {
        cleaned = cleaned.substring(firstBrace);

        // Count nesting
        let braceStack = 0;
        let bracketStack = 0;
        let inString = false;

        for (let i = 0; i < cleaned.length; i++) {
          const char = cleaned[i];
          if (char === '"' && cleaned[i - 1] !== "\\") inString = !inString;
          if (!inString) {
            if (char === "{") braceStack++;
            if (char === "}") braceStack--;
            if (char === "[") bracketStack++;
            if (char === "]") bracketStack--;
          }
        }

        // Repair truncated nesting
        if (bracketStack > 0) cleaned += "]".repeat(bracketStack);
        if (braceStack > 0) cleaned += "}".repeat(braceStack);
      }

      const parsed = JSON.parse(cleaned) as T;
      return {
        data: parsed,
        raw: result,
      };
    } catch (err) {
      logger.error({ content }, "CRITICAL: Gemini returned invalid JSON");
      throw new Error(`Gemini returned invalid JSON: ${(err as any).message}`);
    }
  }
}
