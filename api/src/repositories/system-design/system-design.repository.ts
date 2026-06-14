import { MongoBaseRepository } from "../base.repository";
import { SystemDesignTopicModel, SystemDesignTopic, SystemDesignTopicDocument } from "../../mongo/models/system-design-topic.model";
import type { ICradle } from "../../libs/awilix-container";
import type { CreateSystemDesignTopicInput } from "../../validators/system-design.validator";

export interface ISystemDesignRepository {
  getTopics(): Promise<Partial<SystemDesignTopic>[]>;
  getTopicContent(slug: string): Promise<SystemDesignTopic | null>;
  createTopic(data: CreateSystemDesignTopicInput): Promise<Partial<SystemDesignTopic>>;
}

export class SystemDesignRepository 
  extends MongoBaseRepository<SystemDesignTopic, SystemDesignTopicDocument> 
  implements ISystemDesignRepository 
{
  constructor(_: ICradle) {
    super(SystemDesignTopicModel);
  }

  // Uses projection to exclude the heavy markdown content
  async getTopics(): Promise<Partial<SystemDesignTopic>[]> {
    const docs = await this.model
      .find()
      .select("-content")
      .sort({ order: 1 })
      .lean()
      .exec();
    
    return this.toDomainArray(docs as any);
  }

  // Fetches a single topic by slug, including the markdown content
  async getTopicContent(slug: string): Promise<SystemDesignTopic | null> {
    const doc = await this.model
      .findOne({ slug })
      .lean()
      .exec();
      
    if (!doc) return null;
    return this.toDomain(doc as any);
  }

  async createTopic(data: CreateSystemDesignTopicInput): Promise<Partial<SystemDesignTopic>> {
    const doc = await this.model.findOneAndUpdate(
      { slug: data.slug },
      { $set: data },
      { returnDocument: "after", upsert: true }
    ).select("slug topic_id").exec(); // Drop the heavy content from the return payload!

    return this.toDomain(doc as any) as Partial<SystemDesignTopic>;
  }
}

