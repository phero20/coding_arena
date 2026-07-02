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
  private readonly apiKey: string;
  private readonly baseUrl: string = config.oneApiBaseUrl;
  private circuitBreaker = new CircuitBreaker("Gemini API Gateway", 3, 1, 60000);

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
    this.apiKey = config.oneApiToken;
  }

  /**
   * Calls Gemini via One API gateway with the standard chat completions endpoint.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
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
    }
  ): Promise<GeminiJsonResponse<T>> {
    const body = {
      model: modelName,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 8192,
    };

    const startTime = this.clock.now();

    const response = await this.circuitBreaker.execute(() => fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000), // 120 second timeout
    }));

    const duration = this.clock.now() - startTime;
    metrics.recordLlmLatency(duration);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini request failed with status ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as any;
    const content = json.choices?.[0]?.message?.content;

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
        raw: json,
      };
    } catch (err) {
      logger.error({ content, model: modelName }, "CRITICAL: Gemini returned invalid JSON");
      throw new Error(`Gemini (${modelName}) returned invalid JSON: ${(err as any).message}`);
    }
  }
}