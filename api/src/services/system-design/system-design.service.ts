import { type ISystemDesignRepository } from "../../repositories/system-design/system-design.repository";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";
import type { CreateSystemDesignTopicInput } from "../../validators/system-design.validator";

const logger = createLogger("system-design.service");

export interface ISystemDesignService {
  getTopics(): Promise<any>;
  getTopicContent(slug: string): Promise<any>;
  createTopic(data: CreateSystemDesignTopicInput): Promise<any>;
}

export class SystemDesignService implements ISystemDesignService {
  private systemDesignRepository: ISystemDesignRepository;

  constructor({ systemDesignRepository }: { systemDesignRepository: ISystemDesignRepository }) {
    this.systemDesignRepository = systemDesignRepository;
  }

  async getTopics(): Promise<any> {
    try {
      return await this.systemDesignRepository.getTopics();
    } catch (error: any) {
      logger.error({ err: error }, "Failed to fetch topics");
      throw new AppError("Failed to fetch topics", { statusCode: 500 });
    }
  }

  async getTopicContent(slug: string): Promise<any> {
    if (!slug) {
      throw new AppError("Topic slug is required", { statusCode: 400 });
    }

    try {
      const topic = await this.systemDesignRepository.getTopicContent(slug);
      
      if (!topic) {
        throw new AppError("Topic not found", { statusCode: 404 });
      }
      
      return topic;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      
      logger.error({ err: error, slug }, "Failed to fetch topic");
      throw new AppError("Failed to fetch topic", { statusCode: 500 });
    }
  }

  async createTopic(data: CreateSystemDesignTopicInput): Promise<any> {
    try {
      return await this.systemDesignRepository.createTopic(data);
    } catch (error: any) {
      logger.error({ err: error, slug: data.slug }, "Failed to create topic");
      throw new AppError("Failed to create topic", { statusCode: 500 });
    }
  }
}
