import { BaseController } from '../base.controller';
import { type ITaxonomyService } from '../../services/taxonomy/taxonomy.service';
import { type ICradle } from '../../libs/awilix-container';
import { type ControllerRequest } from '../../types/infrastructure/hono.types';
import {
  type CreateCategoryPayload,
  type MapProblemPayload,
  type SlugParams,
  type MapParams,
} from '../../types/taxonomy/taxonomy.types';

export class TaxonomyController extends BaseController {
  private readonly taxonomyService: ITaxonomyService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.taxonomyService = cradle.taxonomyService;
  }

  /**
   * GET /api/v1/taxonomy/tree
   * Public: Returns the full recursive mind-map of all topics and patterns.
   */
  async getTree(_req: ControllerRequest): Promise<any> {
    return this.taxonomyService.getTaxonomyTree();
  }

  /**
   * GET /api/v1/taxonomy/:slug
   * Public: Returns category details including parent, children, and mapped problems.
   */
  async getCategoryDetail(req: ControllerRequest<never, SlugParams>): Promise<any> {
    return this.taxonomyService.getCategoryDetail(req.params.slug);
  }

  /**
   * POST /api/v1/taxonomy/categories
   * Admin only: Creates a new node in the taxonomy tree.
   */
  async createCategory(req: ControllerRequest<CreateCategoryPayload>): Promise<any> {
    return this.taxonomyService.createCategory(req.body);
  }

  /**
   * POST /api/v1/taxonomy/map
   * Admin only: Links a MongoDB problem to a specific category/pattern.
   */
  async mapProblem(req: ControllerRequest<MapProblemPayload>): Promise<{ success: boolean }> {
    await this.taxonomyService.mapProblemToCategory(req.body);
    return { success: true };
  }

  /**
   * DELETE /api/v1/taxonomy/map/:categoryId/:problemId
   * Admin only: Removes a problem-to-category link.
   */
  async unmapProblem(req: ControllerRequest<never, MapParams>): Promise<{ success: boolean }> {
    await this.taxonomyService.unmapProblemFromCategory(
      req.params.categoryId,
      req.params.problemId,
    );
    return { success: true };
  }
}
