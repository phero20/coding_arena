import { config } from "../../configs/env";
import { metrics } from "../../libs/core/metrics";
import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import * as crypto from "crypto";

const logger = createLogger("groq-llm.service");

export interface GroqJsonResponse<T> {
  data: T;
  raw: unknown;
}

import { CircuitBreaker } from "../../libs/circuit-breaker";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../common/clock.service";

/**
 * Thin client around Groq's OpenAI-compatible chat completions API.
 *
 * This service is intentionally generic: it knows nothing about problems or test
 * cases. Higher-level services should handle prompt design and type-checking.
 */
export class GroqLlmService {
  private readonly clock: IClockService;
  private readonly apiKey: string = config.groqApiKey as string;
  private readonly baseUrl: string = "https://api.groq.com/openai/v1";
  private readonly model: string = "openai/gpt-oss-120b";
  
  private circuitBreaker = new CircuitBreaker("Groq API", 3, 1, 60000);

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  private ensureConfigured() {
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }
  }

  /**
   * Calls Groq with a system + user prompt and expects a single JSON object back.
   *
   * The caller is responsible for providing clear instructions so the model
   * returns valid JSON matching the expected TypeScript shape.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    model?: string;
    maxTokens?: number;
  }): Promise<GroqJsonResponse<T>> {
    this.ensureConfigured();

    const body = {
      model: opts.model ?? this.model,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 2048,
      response_format: { type: "json_object" },
    };

    const promptHash = crypto
      .createHash("sha256")
      .update(opts.systemPrompt + opts.userPrompt)
      .digest("hex");
    const cacheKey = `ai:cache:diagram:${promptHash}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ cacheKey }, "🚀 CACHE HIT: Served LLM response from Redis");
        return {
          data: JSON.parse(cached),
          raw: { cached: true },
        };
      }
    } catch (err) {
      logger.error({ err }, "Redis GET error in GroqLlmService");
    }

    const startTime = this.clock.now();

    const response = await this.circuitBreaker.execute(() => fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // 30 second timeout to prevent memory leaks/hangs
    }));

    const duration = this.clock.now() - startTime;
    metrics.recordLlmLatency(duration);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `Groq request failed with status ${response.status}: ${errText}`,
      );
    }

    const json = (await response.json()) as any;
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq response did not contain any content");
    }

    try {
      // In JSON mode, the model should return a valid JSON string.
      const parsed = JSON.parse(content) as T;

      // Cache the successful response
      try {
        await redis.set(cacheKey, JSON.stringify(parsed), "EX", 86400); // 24 hours
      } catch (err) {
        logger.error({ err }, "Redis SET error in GroqLlmService");
      }

      return {
        data: parsed,
        raw: json,
      };
    } catch (err) {
      logger.error({ content, err }, "Failed to parse Groq JSON content");
      throw new Error(
        "Groq returned invalid JSON despite JSON mode being enabled",
      );
    }
  }
}
