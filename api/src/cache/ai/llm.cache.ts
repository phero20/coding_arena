import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import * as crypto from "crypto";
import { type ICradle } from "../../libs/awilix-container";
import {
  type ILlmService,
  type LlmJsonResponse,
  LlmService,
} from "../../services/ai/llm.service";

const logger = createLogger("llm-cache");

export class LlmCache implements ILlmService {
  private readonly rawLlmService: LlmService;

  constructor({ rawLlmService }: ICradle) {
    this.rawLlmService = rawLlmService;
  }

  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<LlmJsonResponse<T>> {
    const modelName = opts.model;
    if (!modelName) {
      throw new Error("Model name must be explicitly provided in opts.model");
    }

    const promptHash = crypto
      .createHash("sha256")
      .update(opts.systemPrompt + opts.userPrompt)
      .digest("hex");
    const cacheKey = `ai:cache:unified:${modelName}:${promptHash}`;

    // 1. Try to serve from Redis Cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(
          { cacheKey, model: modelName },
          "🚀 CACHE HIT: Served LLM response from Redis",
        );
        return {
          data: JSON.parse(cached),
          raw: { cached: true },
        };
      }
    } catch (err) {
      logger.error({ err, cacheKey }, "Redis GET error in LlmCache");
    }

    // 2. Cache Miss: Execute the raw service call
    const result = await this.rawLlmService.generateJson<T>(opts);

    // 3. Cache the successful response back into Redis (24 Hours)
    try {
      await redis.set(cacheKey, JSON.stringify(result.data), "EX", 86400);
    } catch (err) {
      logger.error({ err, cacheKey }, "Redis SET error in LlmCache");
    }

    return result;
  }
}
