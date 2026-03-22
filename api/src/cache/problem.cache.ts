import { redis } from '../libs/redis';
import type { Problem } from '../mongo/models/problem.model';
import type { ProblemService } from '../services/problem.service';
import type { CreateOrUpdateProblemInput } from '../repositories/problem.repository';

/**
 * ProblemCache wraps the ProblemService to provide Redis-based caching.
 * It improves performance for frequently accessed problems.
 */
export class ProblemCache {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(private readonly problemService: ProblemService) {}

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    const key = `problem:slug:${slug}`;
    
    try {
      const cached = await redis.get<Problem>(key);
      if (cached) return cached;
    } catch (err) {
      console.error('[ProblemCache] Redis get error:', err);
    }

    const problem = await this.problemService.getProblemBySlug(slug);

    if (problem) {
      try {
        await redis.set(key, problem, { ex: this.CACHE_TTL });
        // Also cache by ID for cross-reference
        await redis.set(`problem:${problem.problem_id}`, problem, { ex: this.CACHE_TTL });
      } catch (err) {
        console.error('[ProblemCache] Redis set error:', err);
      }
    }

    return problem;
  }

  async getProblemById(id: string): Promise<Problem | null> {
    const key = `problem:${id}`;
    
    try {
      const cached = await redis.get<Problem>(key);
      if (cached) return cached;
    } catch (err) {
      console.error('[ProblemCache] Redis get error:', err);
    }

    const problem = await this.problemService.getProblemById(id);

    if (problem) {
      try {
        await redis.set(key, problem, { ex: this.CACHE_TTL });
        // Also cache by slug
        await redis.set(`problem:slug:${problem.problem_slug}`, problem, { ex: this.CACHE_TTL });
      } catch (err) {
        console.error('[ProblemCache] Redis set error:', err);
      }
    }

    return problem;
  }

  async searchByTopic(topic: string, limit?: number): Promise<Problem[]> {
    // Search is dynamic, usually not cached at this grain unless it's "Popular Topics"
    return this.problemService.searchByTopic(topic, limit);
  }

  async getAllProblems(page: number, limit: number): Promise<{ problems: Problem[]; total: number }> {
    const key = `problems:page:${page}:${limit}`;
    
    try {
      const cached = await redis.get<{ problems: Problem[]; total: number }>(key);
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.error('[ProblemCache] Redis get error:', err);
    }

    const result = await this.problemService.getAllProblems(page, limit);

    try {
      await redis.set(key, result, { ex: 1800 }); // 30 mins for list
    } catch (err) {
      console.error('[ProblemCache] Redis set error:', err);
    }

    return result;
  }

  async upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem> {
    const problem = await this.problemService.upsertProblem(input);
    
    // Invalidate individual caches
    try {
      await redis.del(`problem:${problem.problem_id}`);
      await redis.del(`problem:slug:${problem.problem_slug}`);
      
      // Invalidate all paginated list segments
      // Note: In production with many keys, we'd use a versioning prefix or a set of keys
      // For now, clearing based on prefix is industry standard for small-mid size lists.
      const keys = await redis.keys('problems:page:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      console.log(`[ProblemCache] Invalidated all problem caches for update: ${problem.problem_id}`);
    } catch (err) {
      console.error('[ProblemCache] Redis invalidation error:', err);
    }

    return problem;
  }
}
