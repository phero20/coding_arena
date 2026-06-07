import { BaseController } from "../base.controller";
import { type SeoService } from "../../services/seo/seo.service";
import { type ICradle } from "../../libs/awilix-container";
import { type ControllerRequest } from "../../types/infrastructure/hono.types";

export class SeoController extends BaseController {
  private readonly seoService: SeoService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.seoService = cradle.seoService;
  }

  async getSitemapProblems(_req: ControllerRequest<never, never, never>) {
    const problems = await this.seoService.getProblemsSitemapData();
    return { problems };
  }

  async getSitemapAcademyTracks(_req: ControllerRequest<never, never, never>) {
    const tracks = await this.seoService.getAcademyTracksSitemapData();
    return { tracks };
  }

  async getSitemapAcademyExercises(_req: ControllerRequest<never, never, never>) {
    const exercises = await this.seoService.getAcademyExercisesSitemapData();
    return { exercises };
  }

  async getSitemapSystemDesignLessons(_req: ControllerRequest<never, never, never>) {
    const lessons = await this.seoService.getSystemDesignLessonsSitemapData();
    return { lessons };
  }

  async getSitemapCompanyTags(_req: ControllerRequest<never, never, never>) {
    const companies = await this.seoService.getCompanyTagsSitemapData();
    return { companies };
  }

  async getSitemapUsers(_req: ControllerRequest<never, never, never>) {
    const users = await this.seoService.getUsersSitemapData();
    return { users };
  }
}
