import { type IAcademyRepository } from "../../repositories/academy/academy.repository";
import { AppError } from "../../utils/app-error";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("academy.service");

export interface IAcademyService {
  getTracks(): Promise<any>;
  getTrackConfig(slug: string): Promise<any>;
  getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any>;
  getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any>;
  getSolvedExercises(userId: string, trackSlug: string): Promise<string[]>;
}

export class AcademyService implements IAcademyService {
  private academyRepository: IAcademyRepository;

  constructor({ academyRepository }: { academyRepository: IAcademyRepository }) {
    this.academyRepository = academyRepository;
  }

  async getTracks(): Promise<any> {
    try {
      const tracks = await this.academyRepository.getTracks();
      if (!tracks) throw new AppError("Tracks not found", { statusCode: 404 });
      return tracks;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error }, "Failed to fetch tracks");
      throw new AppError("Failed to fetch tracks", { statusCode: 500 });
    }
  }

  async getTrackConfig(slug: string): Promise<any> {
    if (!slug) throw new AppError("Track slug is required", { statusCode: 400 });

    try {
      const config = await this.academyRepository.getTrackConfig(slug);
      if (!config) throw new AppError("Track configuration not found", { statusCode: 404 });
      return config;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, slug }, "Failed to fetch track config");
      throw new AppError("Failed to fetch track configuration", { statusCode: 500 });
    }
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    if (!trackSlug || !conceptSlug) {
      throw new AppError("Track slug and concept slug are required", { statusCode: 400 });
    }

    try {
      const concept = await this.academyRepository.getTrackConcept(trackSlug, conceptSlug);
      if (!concept) throw new AppError("Concept not found", { statusCode: 404 });
      return concept;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, trackSlug, conceptSlug }, "Failed to fetch concept");
      throw new AppError("Failed to fetch concept", { statusCode: 500 });
    }
  }

  async getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any> {
    if (!trackSlug || !exerciseSlug) {
      throw new AppError("Track slug and exercise slug are required", { statusCode: 400 });
    }

    try {
      const exercise = await this.academyRepository.getTrackExercise(trackSlug, exerciseSlug);
      if (!exercise) throw new AppError("Exercise not found", { statusCode: 404 });
      return exercise;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, trackSlug, exerciseSlug }, "Failed to fetch exercise");
      throw new AppError("Failed to fetch exercise", { statusCode: 500 });
    }
  }

  async getSolvedExercises(userId: string, trackSlug: string): Promise<string[]> {
    if (!userId) {
      throw new AppError("Unauthorized", { statusCode: 401 });
    }
    if (!trackSlug) {
      throw new AppError("Track slug is required", { statusCode: 400 });
    }

    try {
      return await this.academyRepository.getSolvedExercises(userId, trackSlug);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error({ err: error, trackSlug, userId }, "Failed to fetch solved exercises");
      throw new AppError("Failed to fetch solved exercises", { statusCode: 500 });
    }
  }
}
