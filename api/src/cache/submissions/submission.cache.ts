import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type { 
  ISubmissionService, 
  SubmissionService 
} from "../../services/submissions/submission.service";
import type { 
  Submission, 
  CreateSubmissionInput,
} from "../../types/submissions/submission.types";
import type { UpdateSubmissionStatusInput } from "../../repositories/submissions/submission.repository";
import type { ArenaMatch } from "../../mongo/models/arena-match.model";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("submission-cache");

/**
 * SubmissionCache Decorator
 * Caches the 'heartbeat' of the dashboard (recent submissions) and handles invalidation.
 */
export class SubmissionCache implements ISubmissionService {
  private readonly CACHE_TTL = 1800; // 30 minutes
  private readonly rawSubmissionService: ISubmissionService;

  constructor({ rawSubmissionService }: ICradle) {
    this.rawSubmissionService = rawSubmissionService;
  }

  async getRecentSubmissions(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    submissions: Submission[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    // Only cache the first page (Dashboard standard)
    if (offset !== 0 || limit > 10) {
      return this.rawSubmissionService.getRecentSubmissions(userId, limit, offset);
    }

    const cacheKey = `user:submissions:recent:${userId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ userId }, "🚀 CACHE HIT: Recent submissions served from Redis");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ userId, err }, "Redis GET error in submission cache");
    }

    const result = await this.rawSubmissionService.getRecentSubmissions(userId, limit, offset);

    if (result && result.submissions.length > 0) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ userId, err }, "Redis SET error in submission cache");
      }
    }

    return result;
  }

  async updateSubmissionStatus(
    input: UpdateSubmissionStatusInput,
    traceId?: string,
  ): Promise<Submission | null> {
    const submission = await this.rawSubmissionService.updateSubmissionStatus(input, traceId);
    
    // Invalidate the recent feed when a status changes (e.g. from PENDING to ACCEPTED)
    if (submission) {
      await this.invalidateRecentCache(submission.userId);
    }
    
    return submission;
  }

  async createSubmission(
    input: CreateSubmissionInput,
    traceId?: string,
  ): Promise<Submission> {
    const submission = await this.rawSubmissionService.createSubmission(input, traceId);
    
    // Invalidate the recent feed so the new submission shows up immediately
    await this.invalidateRecentCache(submission.userId);
    
    return submission;
  }

  private async invalidateRecentCache(userId: string) {
    const cacheKey = `user:submissions:recent:${userId}`;
    try {
      await redis.del(cacheKey);
      logger.info({ userId }, "♻️ CACHE INVALIDATED: User submission feed cleared");
    } catch (err) {
      logger.error({ userId, err }, "Redis DEL error in submission cache");
    }
  }

  // Pass-through methods for non-cached operations
  getSubmissionById(id: string): Promise<Submission | null> {
    return this.rawSubmissionService.getSubmissionById(id);
  }

  getUserSubmissions(userId: string, problemId: string, clerkId?: string): Promise<Submission[]> {
    return this.rawSubmissionService.getUserSubmissions(userId, problemId, clerkId);
  }

  getArenaMatchById(id: string): Promise<ArenaMatch | null> {
    return this.rawSubmissionService.getArenaMatchById(id);
  }

  getArenaRoom(roomId: string): Promise<any> {
    return this.rawSubmissionService.getArenaRoom(roomId);
  }
}
