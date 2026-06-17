import { BaseController } from '../base.controller';
import { type ITaxonomyService } from '../../services/taxonomy/taxonomy.service';
import { type ICradle } from '../../libs/awilix-container';
import { type ControllerRequest } from '../../types/infrastructure/hono.types';
import {
  type SlugParams,
  type IdParams,
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
   * GET /api/v1/taxonomy/user/progress
   * Private: Returns a map of categoryId -> direct solved count for the user.
   */
  async getUserProgress(req: ControllerRequest): Promise<any> {
    if (!req.user?.id) return {};
    return this.taxonomyService.getUserRoadmapProgress(req.user.id);
  }

  /**
   * GET /api/v1/taxonomy/:slug
   * Public: Returns category details including parent, children, and mapped problems.
   */
  async getCategoryDetail(req: ControllerRequest<never, SlugParams>): Promise<any> {
    return this.taxonomyService.getCategoryDetail(req.params.slug, req.user?.id);
  }

  /**
   * GET /api/v1/taxonomy/detail/:id
   * Public: Returns category details by UUID.
   */
  async getCategoryDetailById(req: ControllerRequest<never, IdParams>): Promise<any> {
    return this.taxonomyService.getCategoryDetailById(req.params.id, req.user?.id);
  }
}
