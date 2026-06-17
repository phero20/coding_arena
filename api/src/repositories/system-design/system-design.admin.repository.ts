import { MongoBaseRepository } from "../base.repository";
import { SystemDesignTopicModel, type SystemDesignTopicDocument, type SystemDesignTopic } from "../../mongo/models/system-design-topic.model";
import type {
  CreateSystemDesignTopicPayload,
  UpdateSystemDesignTopicPayload,
} from "../../types/system-design/system-design.admin.types";

export interface ISystemDesignAdminRepository {
  createTopic(payload: CreateSystemDesignTopicPayload): Promise<SystemDesignTopic>;
  getAllTopics(): Promise<SystemDesignTopic[]>;
  findById(id: string): Promise<SystemDesignTopic | null>;
  updateTopic(id: string, payload: UpdateSystemDesignTopicPayload): Promise<SystemDesignTopic | null>;
  deleteTopic(id: string): Promise<void>;
  bulkUpdateOrder(mappings: Array<{ id: string; order: number }>): Promise<void>;
}

export class SystemDesignAdminRepository
  extends MongoBaseRepository<SystemDesignTopic, SystemDesignTopicDocument>
  implements ISystemDesignAdminRepository
{
  constructor() {
    super(SystemDesignTopicModel);
  }

  async createTopic(payload: CreateSystemDesignTopicPayload): Promise<SystemDesignTopic> {
    const doc = await this.model.create(payload);
    return this.toDomain(doc) as SystemDesignTopic;
  }

  async getAllTopics(): Promise<SystemDesignTopic[]> {
    const docs = await this.model.find().sort({ order: 1 }).lean().exec();
    return this.toDomainArray(docs as any[]);
  }

  // findById is inherited from MongoBaseRepository

  async updateTopic(id: string, payload: UpdateSystemDesignTopicPayload): Promise<SystemDesignTopic | null> {
    const doc = await this.model.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean().exec();
    return this.toDomain(doc as any);
  }

  async deleteTopic(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async bulkUpdateOrder(mappings: Array<{ id: string; order: number }>): Promise<void> {
    const bulkOps = mappings.map((mapping) => ({
      updateOne: {
        filter: { _id: mapping.id },
        update: { $set: { order: mapping.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.model.bulkWrite(bulkOps);
    }
  }
}
