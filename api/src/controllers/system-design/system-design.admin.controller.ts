import { BaseController } from '../base.controller';
import { type ISystemDesignAdminService } from '../../services/system-design/system-design.admin.service';
import { type ICradle } from '../../libs/awilix-container';
import { type ControllerRequest } from '../../types/infrastructure/hono.types';
import {
  type CreateSystemDesignTopicPayload,
  type UpdateSystemDesignTopicPayload,
  type BulkReorderSystemDesignTopicsPayload,
  type IdParams,
} from '../../types/system-design/system-design.admin.types';

export class SystemDesignAdminController extends BaseController {
  private readonly systemDesignAdminService: ISystemDesignAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.systemDesignAdminService = cradle.systemDesignAdminService;
  }

  async getAllTopics(req: ControllerRequest<never>): Promise<any> {
    return this.systemDesignAdminService.getAllTopics();
  }

  async createTopic(req: ControllerRequest<CreateSystemDesignTopicPayload>): Promise<any> {
    return this.systemDesignAdminService.createTopic(req.body);
  }

  async updateTopic(req: ControllerRequest<UpdateSystemDesignTopicPayload, IdParams>): Promise<any> {
    return this.systemDesignAdminService.updateTopic(req.params.id, req.body);
  }

  async deleteTopic(req: ControllerRequest<never, IdParams>): Promise<{ success: boolean }> {
    await this.systemDesignAdminService.deleteTopic(req.params.id);
    return { success: true };
  }

  async bulkReorderTopics(req: ControllerRequest<BulkReorderSystemDesignTopicsPayload>): Promise<{ success: boolean }> {
    await this.systemDesignAdminService.bulkReorderTopics(req.body);
    return { success: true };
  }
}
