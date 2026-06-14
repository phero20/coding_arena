import { BaseController } from "../base.controller";
import { type ISystemDesignService } from "../../services/system-design/system-design.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { createSystemDesignTopicSchema } from "../../validators/system-design.validator";
import { ApiResponse } from "../../utils/api-response";

export class SystemDesignController extends BaseController {
  private readonly systemDesignService: ISystemDesignService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.systemDesignService = cradle.systemDesignService;
  }

  async getTopics(_req: ControllerRequest<never, never, never>) {
    return await this.systemDesignService.getTopics();
  }

  async getTopicContent(req: ControllerRequest<never, { slug: string }, never>) {
    return await this.systemDesignService.getTopicContent(req.params.slug);
  }

  async createTopic(req: ControllerRequest<any>) {
    await this.systemDesignService.createTopic(req.body);
    
    return ApiResponse.success({ success: true, message: `Topic ${req.body.slug} created/updated successfully` });
  }
}
