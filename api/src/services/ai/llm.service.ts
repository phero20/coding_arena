import { config } from "../../configs/env";
import { metrics } from "../../libs/core/metrics";
import { createLogger } from "../../libs/utils/logger";
import { CircuitBreaker } from "../../libs/circuit-breaker";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../common/clock.service";

const logger = createLogger("llm.service");

export interface LlmJsonResponse<T> {
  data: T;
  raw: any;
}

export interface ILlmService {
  generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<LlmJsonResponse<T>>;
}

export class LlmService implements ILlmService {
  private readonly clock: IClockService;
  private readonly apiKey: string;
  private readonly baseUrl: string = config.oneApiBaseUrl;
  private circuitBreaker = new CircuitBreaker("LLM API Gateway", 3, 1, 60000);

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
    this.apiKey = config.oneApiToken;
  }

  /**
   * Calls the OneAPI gateway with system + user prompts and returns parsed JSON.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<LlmJsonResponse<T>> {
    if (!opts.model) {
      throw new Error("Model name must be explicitly provided in opts.model");
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
  ): Promise<LlmJsonResponse<T>> {
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

    // Execute request with Circuit Breaker
    const response = await this.circuitBreaker.execute(() =>
      fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000), // 120 second timeout
      })
    );

    const duration = this.clock.now() - startTime;
    metrics.recordLlmLatency(duration);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `LLM request failed (Model: ${modelName}) with status ${response.status}: ${errText}`
      );
    }

    const json = (await response.json()) as any;
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(`LLM response (Model: ${modelName}) did not contain any content`);
    }

    try {
      // Strip Markdown code blocks if present
      let cleaned = content.replace(/^```json\n?|```$/g, "").trim();

      // Hallucination Guard: Detect repeating bracket garbage
      if (/(\{ *\} *){5,}/.test(cleaned) || /(\{ *){10,}/.test(cleaned)) {
        throw new Error("Model returned repeating bracket garbage (hallucination)");
      }

      // Advanced JSON Repair for Truncated Responses
      const unescapedQuotes = (cleaned.replace(/\\"/g, "").match(/"/g) || []).length;
      if (unescapedQuotes % 2 !== 0) {
        cleaned += '"';
      }

      cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
      cleaned = cleaned.replace(/,\s*$/g, "");

      // Fix unescaped backslashes (common in LaTeX formulas)
      cleaned = cleaned.replace(/(?<!\\)\\([^"\\/bfnrtu])/g, "\\\\$1");

      // Extract JSON part (First '{' to last possible closing)
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
          cleaned = cleaned.substring(0, endIdx + 1);
        } else if (braceStack > 0 && braceStack < 20) {
          cleaned += "}".repeat(braceStack);
        }
      }

      const parsed = JSON.parse(cleaned) as T;
      return {
        data: parsed,
        raw: json,
      };
    } catch (err) {
      logger.error(
        { content, model: modelName, err: (err as any).message },
        "CRITICAL: LLM returned invalid JSON"
      );
      throw new Error(
        `LLM (${modelName}) returned invalid JSON: ${(err as any).message}`
      );
    }
  }
}
