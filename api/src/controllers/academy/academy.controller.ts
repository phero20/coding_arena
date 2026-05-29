import { BaseController } from "../base.controller";
import { type IAcademyService } from "../../services/academy/academy.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";

export class AcademyController extends BaseController {
  private readonly academyService: IAcademyService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.academyService = cradle.academyService;
  }

  async getTracks(_req: ControllerRequest<never, never, never>) {
    return await this.academyService.getTracks();
  }

  async getTrackConfig(req: ControllerRequest<never, { slug: string }, never>) {
    return await this.academyService.getTrackConfig(req.params.slug);
  }

  async getTrackConcept(req: ControllerRequest<never, { trackSlug: string, conceptSlug: string }, never>) {
    const { trackSlug, conceptSlug } = req.params;
    return await this.academyService.getTrackConcept(trackSlug, conceptSlug);
  }

  async getTrackExercise(req: ControllerRequest<never, { trackSlug: string, exerciseSlug: string }, never>) {
    const { trackSlug, exerciseSlug } = req.params;
    return await this.academyService.getTrackExercise(trackSlug, exerciseSlug);
  }

  async getSolvedExercises(req: ControllerRequest<never, { trackSlug: string }, never>) {
    // Note: The service validates userId and trackSlug. 
    // We pass req.user?.id! (since auth middleware protects this route, it will exist, but service will double check)
    return await this.academyService.getSolvedExercises(req.user?.id as string, req.params.trackSlug);
  }
}
