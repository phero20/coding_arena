import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import { 
  type ISolutionService, 
  SolutionService 
} from "../../services/solutions/solution.service";
import { type ICradle } from "../../libs/awilix-container";
import { type SolutionWithAuthor } from "../../repositories/solutions/solution.repository";
import type { Solution } from "../../db/schema";
import { type CreateSolutionInput } from "../../validators/solution.validator";

const logger = createLogger("solution-cache");

/**
 * SolutionCache Decorator
 * Optimizes the 'Community Solutions' tab and User Profile solutions by caching result sets.
 */
export class SolutionCache implements ISolutionService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly rawSolutionService: ISolutionService;

  constructor({ rawSolutionService }: ICradle) {
    this.rawSolutionService = rawSolutionService;
  }

  /**
   * Caches the top solutions for a specific problem.
   */
  async getSolutionsForProblem(problemId: string): Promise<SolutionWithAuthor[]> {
    const cacheKey = `problem:solutions:${problemId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ problemId }, "🚀 CACHE HIT: Community solutions served from Redis");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ problemId, err }, "Redis GET error in solution cache");
    }

    const solutions = await this.rawSolutionService.getSolutionsForProblem(problemId);

    if (solutions && solutions.length > 0) {
      try {
        await redis.set(cacheKey, JSON.stringify(solutions), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ problemId, err }, "Redis SET error in solution cache");
      }
    }

    return solutions;
  }

  /**
   * Caches the first page of a user's uploaded solutions.
   */
  async getSolutionsByUser(
    userId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<{ items: SolutionWithAuthor[]; total: number; limit: number; offset: number }> {
    // Only cache the first page (Dashboard/Profile standard)
    if (offset !== 0 || limit > 10) {
      return this.rawSolutionService.getSolutionsByUser(userId, limit, offset);
    }

    const cacheKey = `user:solutions:recent:${userId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ userId }, "🚀 CACHE HIT: User solutions served from Redis");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ userId, err }, "Redis GET error in user solution cache");
    }

    const result = await this.rawSolutionService.getSolutionsByUser(userId, limit, offset);

    if (result && result.items.length > 0) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ userId, err }, "Redis SET error in user solution cache");
      }
    }

    return result;
  }

  async createSolution(problemId: string, userId: string, input: CreateSolutionInput): Promise<Solution> {
    const solution = await this.rawSolutionService.createSolution(problemId, userId, input);
    await Promise.all([
      this.invalidateProblemCache(problemId),
      this.invalidateUserCache(userId)
    ]);
    return solution;
  }

  async voteForSolution(solutionId: string, userId: string, voteType: number): Promise<void> {
    await this.rawSolutionService.voteForSolution(solutionId, userId, voteType);
    
    // Invalidate both caches since votes affect rankings and display in both views
    const solution = await this.rawSolutionService.getSolutionById(solutionId);
    if (solution) {
      await Promise.all([
        this.invalidateProblemCache(solution.problemId),
        this.invalidateUserCache(solution.userId)
      ]);
    }
  }

  async updateSolution(solutionId: string, userId: string, input: Partial<CreateSolutionInput>): Promise<Solution> {
    const solution = await this.rawSolutionService.updateSolution(solutionId, userId, input);
    await Promise.all([
      this.invalidateProblemCache(solution.problemId),
      this.invalidateUserCache(userId)
    ]);
    return solution;
  }

  async deleteSolution(solutionId: string, userId: string): Promise<void> {
    const solution = await this.rawSolutionService.getSolutionById(solutionId);
    await this.rawSolutionService.deleteSolution(solutionId, userId);
    if (solution) {
      await Promise.all([
        this.invalidateProblemCache(solution.problemId),
        this.invalidateUserCache(userId)
      ]);
    }
  }

  private async invalidateProblemCache(problemId: string) {
    const cacheKey = `problem:solutions:${problemId}`;
    try {
      await redis.del(cacheKey);
      logger.info({ problemId }, "♻️ CACHE INVALIDATED: Problem solutions cleared");
    } catch (err) {
      logger.error({ problemId, err }, "Redis DEL error in solution cache");
    }
  }

  private async invalidateUserCache(userId: string) {
    const cacheKey = `user:solutions:recent:${userId}`;
    try {
      await redis.del(cacheKey);
      logger.info({ userId }, "♻️ CACHE INVALIDATED: User solutions feed cleared");
    } catch (err) {
      logger.error({ userId, err }, "Redis DEL error in solution cache");
    }
  }

  // Pass-through methods
  getSolutionById(id: string): Promise<SolutionWithAuthor> {
    return this.rawSolutionService.getSolutionById(id);
  }
}
