import { createLogger } from "../libs/logger";
import { redis } from "../libs/redis";
import type {
  Problem,
  CreateOrUpdateProblemInput,
} from "../types/problem.types";
import type {
  IProblemService,
  ProblemService,
} from "../services/problem.service";

const logger = createLogger("problem-cache");

export class ProblemCache implements IProblemService {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(private readonly rawProblemService: ProblemService) {}

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    const key = `problem:slug:${slug}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ slug, err }, "Redis get error");
    }

    const problem = await this.rawProblemService.getProblemBySlug(slug);

    if (problem) {
      try {
        await redis.set(key, JSON.stringify(problem), "EX", this.CACHE_TTL);
        await redis.set(
          `problem:${problem.problem_id}`,
          JSON.stringify(problem),
          "EX",
          this.CACHE_TTL,
        );
      } catch (err) {
        logger.error({ id: problem.problem_id, err }, "Redis set error");
      }
    }

    return problem;
  }

  async getProblemById(id: string): Promise<Problem | null> {
    const key = `problem:${id}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ id, err }, "Redis get error");
    }

    const problem = await this.rawProblemService.getProblemById(id);

    if (problem) {
      try {
        await redis.set(key, JSON.stringify(problem), "EX", this.CACHE_TTL);
        await redis.set(
          `problem:slug:${problem.problem_slug}`,
          JSON.stringify(problem),
          "EX",
          this.CACHE_TTL,
        );
      } catch (err) {
        logger.error({ id: problem.problem_id, err }, "Redis set error");
      }
    }

    return problem;
  }

  async searchByTopic(topic: string, limit?: number): Promise<Problem[]> {
    return this.rawProblemService.searchByTopic(topic, limit);
  }

  async getAllProblems(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }> {
    const key = `problems:page:${page}:${limit}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ page, limit, err }, "Redis get error");
    }

    const result = await this.rawProblemService.getAllProblems(page, limit);

    try {
      await redis.set(key, JSON.stringify(result), "EX", 1800); // 30 mins for list
    } catch (err) {
      logger.error({ page, limit, err }, "Redis set error");
    }

    return result;
  }

  async upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem> {
    const problem = await this.rawProblemService.upsertProblem(input);

    try {
      await redis.del(`problem:${problem.problem_id}`);
      await redis.del(`problem:slug:${problem.problem_slug}`);

      const keys = await redis.keys("problems:page:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }

      logger.info({ id: problem.problem_id }, "Invalidated problem caches");
    } catch (err) {
      logger.error({ id: problem.problem_id, err }, "Redis invalidation error");
    }

    return problem;
  }
}
