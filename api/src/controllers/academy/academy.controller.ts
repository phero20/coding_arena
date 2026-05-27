import { BaseController } from "../base.controller";
import { type IAcademyService } from "../../services/academy/academy.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("academy.controller");

export class AcademyController extends BaseController {
  private readonly academyService: IAcademyService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.academyService = cradle.academyService;
  }

  async getTracks(_req: ControllerRequest<never, never, never>) {
    const tracks = await this.academyService.getTracks();
    return tracks;
  }

  async getTrackConfig(req: ControllerRequest<never, { slug: string }, never>) {
    const slug = req.params.slug;
    
    if (!slug) {
      throw new AppError("Track slug is required", { statusCode: 400 });
    }

    try {
      const config = await this.academyService.getTrackConfig(slug);
      return config;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new AppError("Track configuration not found", { statusCode: 404 });
      }
      logger.error({ err: error, slug }, "Failed to fetch track config");
      throw new AppError("Failed to fetch track configuration", { statusCode: 500 });
    }
  }

  async getTrackConcept(req: ControllerRequest<never, { trackSlug: string, conceptSlug: string }, never>) {
    const { trackSlug, conceptSlug } = req.params;
    
    if (!trackSlug || !conceptSlug) {
      throw new AppError("Track slug and concept slug are required", { statusCode: 400 });
    }

    try {
      const concept = await this.academyService.getTrackConcept(trackSlug, conceptSlug);
      return concept;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new AppError("Concept not found", { statusCode: 404 });
      }
      logger.error({ err: error, trackSlug, conceptSlug }, "Failed to fetch concept");
      throw new AppError("Failed to fetch concept", { statusCode: 500 });
    }
  }

  async getTrackExercise(req: ControllerRequest<never, { trackSlug: string, exerciseSlug: string }, never>) {
    const { trackSlug, exerciseSlug } = req.params;
    
    if (!trackSlug || !exerciseSlug) {
      throw new AppError("Track slug and exercise slug are required", { statusCode: 400 });
    }

    try {
      const exercise = await this.academyService.getTrackExercise(trackSlug, exerciseSlug);
      return exercise;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new AppError("Exercise not found", { statusCode: 404 });
      }
      logger.error({ err: error, trackSlug, exerciseSlug }, "Failed to fetch exercise");
      throw new AppError("Failed to fetch exercise", { statusCode: 500 });
    }
  }

  async getSolvedExercises(req: ControllerRequest<never, { trackSlug: string }, never>) {
    const { trackSlug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", { statusCode: 401 });
    }

    if (!trackSlug) {
      throw new AppError("Track slug is required", { statusCode: 400 });
    }

    try {
      const solved = await this.academyService.getSolvedExercises(userId, trackSlug);
      return solved;
    } catch (error: any) {
      logger.error({ err: error, trackSlug, userId }, "Failed to fetch solved exercises");
      throw new AppError("Failed to fetch solved exercises", { statusCode: 500 });
    }
  }
}
