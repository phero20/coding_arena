import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { IAcademyService, AcademyService } from "../../services/academy/academy.service";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("academy-cache");

export class AcademyCache implements IAcademyService {
  private readonly CACHE_TTL = 86400; // 1 day (24 hours)
  private readonly rawAcademyService: AcademyService;

  constructor({ rawAcademyService }: ICradle) {
    this.rawAcademyService = rawAcademyService;
  }

  private async withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ key }, "Academy cache hit");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ key, err }, "Redis get error");
    }

    const result = await fetcher();

    if (result !== null && result !== undefined) {
      try {
        await redis.set(key, JSON.stringify(result), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ key, err }, "Redis set error");
      }
    }

    return result;
  }

  async getTracks(): Promise<any> {
    return this.withCache("academy:tracks", () => this.rawAcademyService.getTracks());
  }

  async getTrackConfig(slug: string): Promise<any> {
    return this.withCache(`academy:config:${slug}`, () => this.rawAcademyService.getTrackConfig(slug));
  }

  async getTrackConcept(trackSlug: string, conceptSlug: string): Promise<any> {
    return this.withCache(`academy:concept:${trackSlug}:${conceptSlug}`, () => this.rawAcademyService.getTrackConcept(trackSlug, conceptSlug));
  }

  async getTrackExercise(trackSlug: string, exerciseSlug: string): Promise<any> {
    return this.withCache(`academy:exercise:${trackSlug}:${exerciseSlug}`, () => this.rawAcademyService.getTrackExercise(trackSlug, exerciseSlug));
  }

  async getSolvedExercises(userId: string, trackSlug: string): Promise<string[]> {
    return this.withCache(`academy:solved:${userId}:${trackSlug}`, () => this.rawAcademyService.getSolvedExercises(userId, trackSlug));
  }
}
