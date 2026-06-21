import { MongoBaseRepository } from "../base.repository";
import { SystemDesignTopicModel, type SystemDesignTopicDocument, type SystemDesignTopic } from "../../mongo/models/system-design-topic.model";
import { db, schema } from "../../db";
import { sql, eq } from "drizzle-orm";
import type { Workspace, Diagram } from "../../db/schema";
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
  getStats(): Promise<{ topics: number; workspaces: number; diagrams: number }>;
  getWorkspacesByUserId(userId: string): Promise<Workspace[]>;
  getDiagramsByUserId(userId: string): Promise<Partial<Diagram>[]>;
  deleteWorkspace(id: string): Promise<void>;
  deleteDiagram(id: string): Promise<void>;
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

  async getStats(): Promise<{ topics: number; workspaces: number; diagrams: number }> {
    const [topics, workspacesCount, diagramsCount] = await Promise.all([
      this.model.countDocuments(),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.workspaces),
      db.select({ count: sql<number>`cast(count(*) as integer)` }).from(schema.diagrams),
    ]);
    return {
      topics,
      workspaces: workspacesCount[0].count,
      diagrams: diagramsCount[0].count
    };
  }

  async getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    return db.select().from(schema.workspaces).where(eq(schema.workspaces.userId, userId));
  }

  async getDiagramsByUserId(userId: string): Promise<Partial<Diagram>[]> {
    const result = await db.select({
      id: schema.diagrams.id,
      title: schema.diagrams.title,
      workspaceId: schema.diagrams.workspaceId,
      createdAt: schema.diagrams.createdAt,
      updatedAt: schema.diagrams.updatedAt,
    })
      .from(schema.diagrams)
      .innerJoin(schema.workspaces, eq(schema.diagrams.workspaceId, schema.workspaces.id))
      .where(eq(schema.workspaces.userId, userId));
    return result;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, id));
  }

  async deleteDiagram(id: string): Promise<void> {
    await db.delete(schema.diagrams).where(eq(schema.diagrams.id, id));
  }
}
