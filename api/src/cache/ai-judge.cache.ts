import { redis } from '../libs/redis';
import * as crypto from 'crypto';
import type { AiCodeJudgeService, AiRunSamplesResult } from '../services/ai-code-judge.service';

interface AiRunSamplesInput {
  problemId: string;
  languageId: string;
  languageName: string;
  sourceCode: string;
  tests: {
    index: number;
    input: string;
    expected_output: string;
  }[];
}

/**
 * AiJudgeCache handles the caching logic for AI-based code judging.
 * It strictly separates Redis/Caching concerns from the core AI Domain Service.
 */
export class AiJudgeCache {
  constructor(private readonly aiService: AiCodeJudgeService) {}

  /**
   * Orchestrates the cached run:
   * 1. Hashing the input source code
   * 2. Checking Redis
   * 3. Calling AI Service on miss
   * 4. Persisting to Redis for 24h on success
   */
  async runSamples(input: AiRunSamplesInput): Promise<AiRunSamplesResult> {
    const sourceHash = crypto
      .createHash('sha256')
      .update(input.sourceCode)
      .digest('hex');

    // Robust caching: Include tests in the hash to distinguish between 
    // "Run" (public tests only) and "Submit" (full tests)
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
      console.error('[AiJudgeCache] Redis error (skipping cache):', err);
    }

    // Cache MISS - Execute core AI logic
    const result = await this.aiService.runSamples(input);

    // Persist result to cache if valid
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400);
    } catch (err) {
      console.error('[AiJudgeCache] Redis error (failed to set cache):', err);
    }

    return result;
  }
}
