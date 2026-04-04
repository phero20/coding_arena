import { createLogger } from '../libs/logger';
import { redis } from '../libs/redis';
import * as crypto from 'crypto';
import type { IAiJudgeService, AiCodeJudgeService, AiRunSamplesInput, AiRunSamplesResult } from '../services/ai-code-judge.service';

const logger = createLogger('ai-judge-cache');

/**
 * AiJudgeCache wraps AiCodeJudgeService with Redis caching.
 * Imports types directly from the service since these types are
 * inherently tied to the AI judge's I/O contract.
 */
export class AiJudgeCache implements IAiJudgeService {
  constructor(private readonly aiService: AiCodeJudgeService) {}

  async runSamples(input: AiRunSamplesInput): Promise<AiRunSamplesResult> {
    const sourceHash = crypto
      .createHash('sha256')
      .update(input.sourceCode)
      .digest('hex');

    const testsHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(input.tests))
      .digest('hex');

    const cacheKey = `ai-cache:${input.problemId}:${input.languageId}:${sourceHash}:${testsHash}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return {
          ...JSON.parse(cached),
          cached: true,
        };
      }
    } catch (err) {
      logger.error({ problemId: input.problemId, languageId: input.languageId, err }, 'Redis get error (skipping cache)');
    }

    const result = await this.aiService.runSamples(input);

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400);
    } catch (err) {
      logger.error({ problemId: input.problemId, languageId: input.languageId, err }, 'Redis set error (failed to set cache)');
    }

    return result;
  }
}
