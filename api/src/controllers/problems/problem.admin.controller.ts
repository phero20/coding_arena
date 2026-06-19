import { BaseController } from "../base.controller";
import { type IProblemAdminService } from "../../services/problems/problem.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import {
  type CreateAdminProblemPayload,
  type UpdateAdminProblemPayload,
} from "../../types/problems/problem.admin.types";
import { ApiResponse } from "../../utils/api-response";

export class ProblemAdminController extends BaseController {
  private readonly problemAdminService: IProblemAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.problemAdminService = cradle.problemAdminService;
  }

  async getAllPaginated(
    req: ControllerRequest<never, never, { page?: number; limit?: number; search?: string }>
  ): Promise<any> {
    const { page = 1, limit = 20, search } = req.query;
    const result = await this.problemAdminService.getAllPaginated(page, limit, search);

    return ApiResponse.paginated(result.data, {
      totalItems: result.total,
      itemCount: result.data.length,
      perPage: limit,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
    });
  }

  async createProblem(req: ControllerRequest<CreateAdminProblemPayload>): Promise<any> {
    return this.problemAdminService.createProblem(req.body);
  }

  async updateProblem(req: ControllerRequest<UpdateAdminProblemPayload, { id: string }>): Promise<any> {
    return this.problemAdminService.updateProblem(req.params.id, req.body);
  }

  async deleteProblem(req: ControllerRequest<never, { id: string }>): Promise<{ success: boolean }> {
    await this.problemAdminService.deleteProblem(req.params.id);
    return { success: true };
  }

  async getProblemById(req: ControllerRequest<never, { id: string }>): Promise<any> {
    return this.problemAdminService.getProblemById(req.params.id);
  }

  async getProblemTests(req: ControllerRequest<never, { id: string }>): Promise<any> {
    return this.problemAdminService.getProblemTests(req.params.id);
  }

  async updateProblemTests(req: ControllerRequest<any, { id: string }>): Promise<any> {
    return this.problemAdminService.updateProblemTests({
      problem_id: req.params.id,
      type: req.body.type,
      cases: req.body.cases,
    });
  }
}
