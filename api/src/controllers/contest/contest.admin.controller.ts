import { BaseController } from "../base.controller";
import { type IContestAdminService } from "../../services/contest/contest.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import {
  type CreateContestPayload,
  type UpdateContestPayload,
} from "../../types/contest/contest.admin.types";

export class ContestAdminController extends BaseController {
  private readonly contestAdminService: IContestAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.contestAdminService = cradle.contestAdminService;
  }

  async getAllContests(req: ControllerRequest<never>): Promise<any> {
    return this.contestAdminService.getAll();
  }

  async createContest(req: ControllerRequest<CreateContestPayload>): Promise<any> {
    return this.contestAdminService.create(req.body as any);
  }

  async updateContest(req: ControllerRequest<UpdateContestPayload, { id: string }>): Promise<any> {
    return this.contestAdminService.update(req.params.id, req.body);
  }

  async deleteContest(req: ControllerRequest<never, { id: string }>): Promise<{ success: boolean }> {
    await this.contestAdminService.delete(req.params.id);
    return { success: true };
  }


}
