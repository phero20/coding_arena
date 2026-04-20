import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type {
  ProblemTest,
  ProblemTestType,
  TestCase,
} from "../../types/problems/problem.types";
import type {
  IProblemTestService,
  ProblemTestService,
} from "../../services/problems/problem-test.service";

const logger = createLogger("problem-test-cache");

export interface UpsertProblemTestInput {
  problem_id: string;
  type: ProblemTestType;
  cases: TestCase[];
}

import { type ICradle } from "../../libs/awilix-container";

export class ProblemTestCache implements IProblemTestService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly rawProblemTestService: ProblemTestService;

  constructor({ rawProblemTestService }: ICradle) {
    this.rawProblemTestService = rawProblemTestService;
  }

  async getTestsForProblem(problem_id: string): Promise<ProblemTest[]> {
    return this.rawProblemTestService.getTestsForProblem(problem_id);
  }

  async getTestsForProblemAndType(
    problem_id: string,
    type: ProblemTestType,
  ): Promise<ProblemTest | null> {
    const key = `problem-tests:${problem_id}:${type}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ problem_id, type, err }, "Redis get error");
    }

    const test = await this.rawProblemTestService.getTestsForProblemAndType(
      problem_id,
      type,
    );

    if (test) {
      try {
        await redis.set(key, JSON.stringify(test), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ problem_id, type, err }, "Redis set error");
      }
    }

    return test;
  }

  async upsertTests(input: UpsertProblemTestInput): Promise<ProblemTest> {
    const test = await this.rawProblemTestService.upsertTests(input);

    try {
      await redis.del(`problem-tests:${test.problem_id}:${test.type}`);
      logger.info(
        { problem_id: test.problem_id, type: test.type },
        "Invalidated problem test cache",
      );
    } catch (err) {
      logger.error(
        { problem_id: test.problem_id, type: test.type, err },
        "Redis del error",
      );
    }

    return test;
  }
}
