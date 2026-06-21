import { BaseController } from "../base.controller";
import { type ITaxonomyAdminService } from "../../services/taxonomy/taxonomy.admin.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import {
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type MapProblemPayload,
  type BatchMapProblemPayload,
  type IdParams,
  type MapParams,
} from "../../types/taxonomy/taxonomy.types";

export class TaxonomyAdminController extends BaseController {
  private readonly taxonomyAdminService: ITaxonomyAdminService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.taxonomyAdminService = cradle.taxonomyAdminService;
  }

  async getAdminTree(req: ControllerRequest<never>): Promise<any> {
    return this.taxonomyAdminService.getAdminTree();
  }

  async getCategoryProblems(
    req: ControllerRequest<never, IdParams>,
  ): Promise<any> {
    return this.taxonomyAdminService.getCategoryProblems(req.params.id);
  }

  async createCategory(
    req: ControllerRequest<CreateCategoryPayload>,
  ): Promise<any> {
    return this.taxonomyAdminService.createCategory(req.body);
  }

  async updateCategory(
    req: ControllerRequest<UpdateCategoryPayload, IdParams>,
  ): Promise<any> {
    return this.taxonomyAdminService.updateCategory(req.params.id, req.body);
  }

  async deleteCategory(
    req: ControllerRequest<never, IdParams>,
  ): Promise<{ success: boolean }> {
    await this.taxonomyAdminService.deleteCategory(req.params.id);
    return { success: true };
  }

  async mapProblem(
    req: ControllerRequest<MapProblemPayload>,
  ): Promise<{ success: boolean }> {
    await this.taxonomyAdminService.mapProblemToCategory(req.body);
    return { success: true };
  }

  async unmapProblem(
    req: ControllerRequest<never, MapParams>,
  ): Promise<{ success: boolean }> {
    await this.taxonomyAdminService.unmapProblemFromCategory(
      req.params.categoryId,
      req.params.problemId,
    );
    return { success: true };
  }

  async batchMapProblems(
    req: ControllerRequest<BatchMapProblemPayload>,
  ): Promise<{ success: boolean }> {
    await this.taxonomyAdminService.batchMapProblemsToCategory(req.body);
    return { success: true };
  }

  async getRoadmapStats(req: ControllerRequest<never>): Promise<any> {
    return this.taxonomyAdminService.getRoadmapStats();
  }
}
