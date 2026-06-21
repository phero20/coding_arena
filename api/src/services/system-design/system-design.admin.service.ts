import { type ICradle } from '../../libs/awilix-container';
import { type ISystemDesignAdminRepository } from '../../repositories/system-design/system-design.admin.repository';
import {
  type CreateSystemDesignTopicPayload,
  type UpdateSystemDesignTopicPayload,
  type BulkReorderSystemDesignTopicsPayload,
} from '../../types/system-design/system-design.admin.types';
import { type SystemDesignTopic } from '../../mongo/models/system-design-topic.model';
import { AppError } from '../../utils/app-error';

export interface ISystemDesignAdminService {
  createTopic(payload: CreateSystemDesignTopicPayload): Promise<SystemDesignTopic>;
  getAllTopics(): Promise<SystemDesignTopic[]>;
  updateTopic(id: string, payload: UpdateSystemDesignTopicPayload): Promise<SystemDesignTopic>;
  deleteTopic(id: string): Promise<void>;
  bulkReorderTopics(payload: BulkReorderSystemDesignTopicsPayload): Promise<void>;
  getStats(): Promise<{ topics: number; workspaces: number; diagrams: number }>;
  getWorkspacesByUserId(userId: string): Promise<any[]>;
  getDiagramsByUserId(userId: string): Promise<any[]>;
  deleteWorkspace(id: string): Promise<void>;
  deleteDiagram(id: string): Promise<void>;
}

export class SystemDesignAdminService implements ISystemDesignAdminService {
  private readonly systemDesignAdminRepo: ISystemDesignAdminRepository;

  constructor({ systemDesignAdminRepository }: ICradle) {
    this.systemDesignAdminRepo = systemDesignAdminRepository;
  }

  async createTopic(payload: CreateSystemDesignTopicPayload): Promise<SystemDesignTopic> {
    return this.systemDesignAdminRepo.createTopic(payload);
  }

  async getAllTopics(): Promise<SystemDesignTopic[]> {
    return this.systemDesignAdminRepo.getAllTopics();
  }

  async updateTopic(id: string, payload: UpdateSystemDesignTopicPayload): Promise<SystemDesignTopic> {
    const updated = await this.systemDesignAdminRepo.updateTopic(id, payload);
    if (!updated) {
      throw AppError.notFound('Topic not found');
    }
    return updated;
  }

  async deleteTopic(id: string): Promise<void> {
    await this.systemDesignAdminRepo.deleteTopic(id);
  }

  async bulkReorderTopics(payload: BulkReorderSystemDesignTopicsPayload): Promise<void> {
    await this.systemDesignAdminRepo.bulkUpdateOrder(payload.mappings);
  }

  async getStats(): Promise<{ topics: number; workspaces: number; diagrams: number }> {
    return this.systemDesignAdminRepo.getStats();
  }

  async getWorkspacesByUserId(userId: string): Promise<any[]> {
    return this.systemDesignAdminRepo.getWorkspacesByUserId(userId);
  }

  async getDiagramsByUserId(userId: string): Promise<any[]> {
    return this.systemDesignAdminRepo.getDiagramsByUserId(userId);
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.systemDesignAdminRepo.deleteWorkspace(id);
  }

  async deleteDiagram(id: string): Promise<void> {
    await this.systemDesignAdminRepo.deleteDiagram(id);
  }
}
