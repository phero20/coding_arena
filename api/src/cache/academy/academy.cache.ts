import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { IAcademyService, AcademyService } from "../../services/academy/academy.service";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("academy-cache");

export class AcademyCache implements IAcademyService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly rawAcademyService: AcademyService;

  constructor({ rawAcademyService }: ICradle) {
    this.rawAcademyService = rawAcademyService;
  }

  async getTracks(): Promise<any> {
    return this.rawAcademyService.getTracks();
  }

  async getTrackConfig(slug: string): Promise<any> {
    return this.rawAcademyService.getTrackConfig(slug);
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    return this.rawAcademyService.getTrackConcept(trackSlug, conceptSlug);
  }

  async getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any> {
    return this.rawAcademyService.getTrackExercise(trackSlug, exerciseSlug);
  }

  async getSolvedExercises(userId: string, trackSlug: string): Promise<string[]> {
    const key = `academy:solved:${userId}:${trackSlug}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ key }, "Academy cache hit");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ userId, trackSlug, err }, "Redis get error");
    }

    const solved = await this.rawAcademyService.getSolvedExercises(userId, trackSlug);

    try {
      await redis.set(key, JSON.stringify(solved), "EX", this.CACHE_TTL);
    } catch (err) {
      logger.error({ userId, trackSlug, err }, "Redis set error");
    }

    return solved;
  }
}
