import { redis } from '../libs/redis';
import type { ProblemTest } from '../mongo/models/problem-test.model';
import type { ProblemTestService } from '../services/problem-test.service';
import type { UpsertProblemTestInput } from '../repositories/problem-test.repository';

/**
 * ProblemTestCache wraps the ProblemTestService to provide Redis-based caching.
 * Extremely important for minimizing DB hits during concurrent code executions.
 */
export class ProblemTestCache {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(private readonly testService: ProblemTestService) {}

  async getTestsForProblem(problem_id: string): Promise<ProblemTest[]> {
    // Usually we fetch by problem AND type in the execution flow, 
    // but we can cache the list too if needed.
    return this.testService.getTestsForProblem(problem_id);
  }

  async getTestsForProblemAndType(
    problem_id: string,
    type: ProblemTest['type'],
  ): Promise<ProblemTest | null> {
    const key = `problem-tests:${problem_id}:${type}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.error('[ProblemTestCache] Redis get error:', err);
    }

    const test = await this.testService.getTestsForProblemAndType(problem_id, type);

    if (test) {
      try {
        await redis.set(key, JSON.stringify(test), 'EX', this.CACHE_TTL);
      } catch (err) {
        console.error('[ProblemTestCache] Redis set error:', err);
      }
    }

    return test;
  }

  async upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest> {
    const test = await this.testService.upsertTests(input);

    // Invalidate cache on update
    try {
      await redis.del(`problem-tests:${test.problem_id}:${test.type}`);
      console.log(`[ProblemTestCache] Invalidated cache for tests: ${test.problem_id}:${test.type}`);
    } catch (err) {
      console.error('[ProblemTestCache] Redis del error:', err);
    }

    return test;
  }
}
