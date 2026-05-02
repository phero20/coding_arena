import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { config } from "../../configs/env";
import { metrics } from "../../libs/core/metrics";
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
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: opts.systemPrompt,
    });

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
      // Robust JSON extraction: Find the first '{' and the last '}'
      let cleaned = content;
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      
      if (start !== -1 && end !== -1) {
        cleaned = content.substring(start, end + 1);
      }

      const parsed = JSON.parse(cleaned) as T;
      return {
        data: parsed,
        raw: result,
      };
    } catch (err) {
      console.error("CRITICAL: Gemini returned invalid JSON. Raw Content follows:");
      console.error("-------------------------------------------");
      console.error(content);
      console.error("-------------------------------------------");
      throw new Error(`Gemini returned invalid JSON: ${(err as any).message}`);
    }
  }
}
