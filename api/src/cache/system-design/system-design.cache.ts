import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { ISystemDesignService, SystemDesignService } from "../../services/system-design/system-design.service";
import { type ICradle } from "../../libs/awilix-container";
import type { CreateSystemDesignTopicInput } from "../../validators/system-design.validator";

const logger = createLogger("system-design-cache");

export class SystemDesignCache implements ISystemDesignService {
  private readonly CACHE_TTL = 86400; // 24 hours
  private readonly rawSystemDesignService: SystemDesignService;

  constructor({ rawSystemDesignService }: ICradle) {
    this.rawSystemDesignService = rawSystemDesignService;
  }

  async getTopics(): Promise<any> {
    const key = `system-design:topics`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ err }, "Redis get error for system design topics");
    }

    const topics = await this.rawSystemDesignService.getTopics();

    if (topics) {
      try {
        await redis.set(key, JSON.stringify(topics), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ err }, "Redis set error for system design topics");
      }
    }

    return topics;
  }

  async getTopicContent(slug: string): Promise<any> {
    const key = `system-design:topic:${slug}`;

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.error({ slug, err }, "Redis get error for system design topic content");
    }

    const topicContent = await this.rawSystemDesignService.getTopicContent(slug);

    if (topicContent) {
      try {
        await redis.set(key, JSON.stringify(topicContent), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ slug, err }, "Redis set error for system design topic content");
      }
    }

    return topicContent;
  }

  async createTopic(data: CreateSystemDesignTopicInput): Promise<any> {
    const topic = await this.rawSystemDesignService.createTopic(data);

    try {
      await redis.del(`system-design:topics`);
      await redis.del(`system-design:topic:${data.slug}`);
      logger.info({ slug: data.slug }, "Invalidated system design caches");
    } catch (err) {
      logger.error({ slug: data.slug, err }, "Redis invalidation error");
    }

    return topic;
  }
}
