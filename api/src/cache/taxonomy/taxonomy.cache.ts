import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type {
  ITaxonomyService,
  TaxonomyService,
} from "../../services/taxonomy/taxonomy.service";
import type {
  CategoryTreeNode,
  CategoryDetail,
  CreateCategoryPayload,
  MapProblemPayload,
  BatchMapProblemPayload,
} from "../../types/taxonomy/taxonomy.types";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("taxonomy-cache");

export class TaxonomyCache implements ITaxonomyService {
  private readonly CACHE_TTL = 3600 * 24; // 24 hours
  private readonly rawTaxonomyService: TaxonomyService;

  constructor({ rawTaxonomyService }: ICradle) {
    this.rawTaxonomyService = rawTaxonomyService;
  }

  async getTaxonomyTree(): Promise<CategoryTreeNode[]> {
    const key = "taxonomy:tree";

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ err }, "Redis get error");
    }

    const tree = await this.rawTaxonomyService.getTaxonomyTree();

    if (tree && tree.length > 0) {
      try {
        await redis.set(key, JSON.stringify(tree), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err }, "Redis set error");
      }
    }

    return tree;
  }

  async getCategoryDetail(slug: string): Promise<CategoryDetail> {
    const key = `taxonomy:category:${slug}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ slug, err }, "Redis get error");
    }

    const detail = await this.rawTaxonomyService.getCategoryDetail(slug);

    if (detail) {
      try {
        await redis.set(key, JSON.stringify(detail), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ slug, err }, "Redis set error");
      }
    }

    return detail;
  }

  async getCategoryDetailById(id: string): Promise<CategoryDetail> {
    const key = `taxonomy:category:id:${id}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ id, err }, "Redis get error");
    }

    const detail = await this.rawTaxonomyService.getCategoryDetailById(id);

    if (detail) {
      try {
        await redis.set(key, JSON.stringify(detail), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ id, err }, "Redis set error");
      }
    }

    return detail;
  }

  async createCategory(payload: CreateCategoryPayload): Promise<any> {
    const result = await this.rawTaxonomyService.createCategory(payload);
    await this.invalidateTaxonomyCaches();
    return result;
  }

  async mapProblemToCategory(payload: MapProblemPayload): Promise<void> {
    await this.rawTaxonomyService.mapProblemToCategory(payload);
    await this.invalidateTaxonomyCaches();
  }

  async batchMapProblemsToCategory(
    payload: BatchMapProblemPayload,
  ): Promise<void> {
    await this.rawTaxonomyService.batchMapProblemsToCategory(payload);
    await this.invalidateTaxonomyCaches();
  }

  async getUserRoadmapProgress(userId: string): Promise<{ counts: Record<string, number>; solvedIds: string[] }> {
    const key = `user:roadmap:progress:${userId}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ userId, err }, "Redis get progress error");
    }

    const progress = await this.rawTaxonomyService.getUserRoadmapProgress(userId);

    try {
      await redis.set(key, JSON.stringify(progress), "EX", 3600 * 2); // 2 hour cache for user progress
    } catch (err) {
      logger.error({ userId, err }, "Redis set progress error");
    }

    return progress;
  }

  async invalidateUserProgress(userId: string): Promise<void> {
    const key = `user:roadmap:progress:${userId}`;
    try {
      await redis.del(key);
    } catch (err) {
      logger.error({ userId, err }, "Redis delete progress error");
    }
  }

  async unmapProblemFromCategory(
    categoryId: string,
    problemId: string,
  ): Promise<void> {
    await this.rawTaxonomyService.unmapProblemFromCategory(
      categoryId,
      problemId,
    );
    await this.invalidateTaxonomyCaches();
  }

  private async invalidateTaxonomyCaches() {
    try {
      await redis.del("taxonomy:tree");
      const keys = await redis.keys("taxonomy:category:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      logger.info("Invalidated taxonomy caches");
    } catch (err) {
      logger.error({ err }, "Redis invalidation error");
    }
  }
}
