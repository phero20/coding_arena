import { ICradle } from "../../libs/awilix-container";
import { createLogger } from "../../libs/utils/logger";
import { ClistService } from "./clist.service";
import { IContestRepository } from "../../repositories/contest/contest.repository";
import { ContestCache } from "../../cache/contest/contest.cache";
import { NewContest, Contest } from "../../db/schema";

const logger = createLogger("contest-service");

/**
 * ContestService orchestrates contest-related business logic and synchronization.
 */
export class ContestService {
  private readonly clistService: ClistService;
  private readonly contestRepository: IContestRepository;
  private readonly contestCache: ContestCache;

  constructor({ clistService, contestRepository, contestCache }: ICradle) {
    this.clistService = clistService;
    this.contestRepository = contestRepository;
    this.contestCache = contestCache;
  }

  /**
   * Synchronizes external contests from CLIST into our PostgreSQL and Redis.
   * This is intended to be called by a background worker.
   */
  async syncExternalContests(): Promise<void> {
    try {
      logger.info("Starting external contest synchronization...");
      
      // 1. Fetch from CLIST (Looking ahead 15 days)
      const fifteenDaysFromNow = new Date();
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      const rawData = await this.clistService.getContests(200, 0, fifteenDaysFromNow); 
      const externalContests = rawData.objects || [];

      if (externalContests.length === 0) {
        logger.warn("No contests found in external source");
        return;
      }

      // 2. Map and Save to PostgreSQL (Source of Truth)
      const processedContests: Contest[] = [];
      
      // Log the first object for debugging if needed
      if (externalContests.length > 0) {
        logger.debug({ firstObject: externalContests[0] }, "Sample contest object from CLIST");
      }

      for (const ext of externalContests) {
        // Safely extract platform name (CLIST v1 returns resource as an object)
        let hostStr = "unknown";
        if (typeof ext.resource === "string") {
          hostStr = ext.resource;
        } else if (ext.resource && typeof ext.resource.name === "string") {
          hostStr = ext.resource.name;
        } else if (typeof ext.host === "string") {
          hostStr = ext.host;
        }

        const platform = hostStr !== "unknown" ? hostStr.split('.')[0] : "unknown";
        const icon = (ext.resource && typeof ext.resource.icon === "string") 
          ? `https://clist.by${ext.resource.icon}` 
          : null;

        const mapped: NewContest = {
          clistId: ext.id,
          title: ext.event || "Untitled Contest",
          platform: platform,
          icon: icon,
          startTime: new Date(ext.start),
          endTime: new Date(ext.end),
          duration: ext.duration || 0,
          href: ext.href || "#",
          resourceId: ext.resource_id,
          status: 'upcoming'
        };

        const saved = await this.contestRepository.upsert(mapped);
        processedContests.push(saved);
      }

      // 3. Sync Upcoming to Redis (Performance Layer)
      const upcoming = processedContests.filter(c => new Date(c.startTime) > new Date());
      await this.contestCache.setUpcomingContests(upcoming);

      logger.info({ total: processedContests.length, upcoming: upcoming.length }, "Contest synchronization complete");
    } catch (err) {
      logger.error({ err }, "Sync Engine failed");
      throw err;
    }
  }

  /**
   * Returns upcoming contests, prioritizing the Redis cache.
   */
  async getUpcomingContests(limit: number = 200): Promise<Contest[]> {
    try {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 15);

      // 1. Check Redis Cache
      let contests = await this.contestCache.getUpcomingContests(limit);
      
      if (contests.length > 0) {
        logger.info({ count: contests.length }, "🔥 Serving contests from Redis cache");
        // Filter cache to match the 15-day window
        return contests.filter(c => new Date(c.startTime) <= maxDate).slice(0, limit);
      }

      // 2. Fallback to PostgreSQL
      logger.info("❄️ Cache miss: Serving contests from PostgreSQL");
      contests = await this.contestRepository.findUpcoming(limit, maxDate);
      
      // 3. Re-prime the cache if we found data in the DB
      if (contests.length > 0) {
        await this.contestCache.setUpcomingContests(contests);
      }

      return contests;
    } catch (err) {
      logger.error({ err }, "Failed to fetch upcoming contests");
      throw err;
    }
  }

  /**
   * Proxies raw external data (legacy/debug).
   */
  async getExternalContests(limit: number = 20, offset: number = 0): Promise<any> {
    return await this.clistService.getContests(limit, offset);
  }
}
