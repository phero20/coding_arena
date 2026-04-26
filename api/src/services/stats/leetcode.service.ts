import { createLogger } from "../../libs/utils/logger";
import { config } from "../../configs/env";

const logger = createLogger("leetcode-service");

export interface LeetCodeStats {
  solved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  contest: {
    rating: number;
    globalRank: number;
    totalParticipants: number;
    topPercentile: number;
    attended: number;
    history: { rating: number; date: string }[];
  } | null;
}

export interface ILeetCodeService {
  getUserStats(username: string): Promise<LeetCodeStats | null>;
}

export class LeetCodeService implements ILeetCodeService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      config.leetcodeApiUrl || "https://leetcode-api-9jjp.onrender.com";
    // Ensure no trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, "");
  }

  /**
   * Fetches aggregated LeetCode stats for a user using alfa-leetcode-api spec.
   */
  async getUserStats(username: string): Promise<LeetCodeStats | null> {
    try {
      logger.info({ username }, "Fetching LeetCode stats from alfa-leetcode-api...");

      // Parallel fetch from primary alfa-leetcode-api endpoints
      const [solvedRes, contestRes] = await Promise.all([
        fetch(`${this.baseUrl}/${username}/solved`),
        fetch(`${this.baseUrl}/${username}/contest`),
      ]);

      if (!solvedRes.ok) {
        logger.warn({ username, status: solvedRes.status }, "Failed to fetch solved stats");
        return null;
      }

      const solvedData = await solvedRes.json();
      const contestData = contestRes.ok ? await contestRes.json() : null;

      return {
        solved: {
          total: solvedData.solvedProblem || 0,
          easy: solvedData.easySolved || 0,
          medium: solvedData.mediumSolved || 0,
          hard: solvedData.hardSolved || 0,
        },
        contest: contestData ? {
          rating: Math.round(contestData.contestRating || 0),
          globalRank: contestData.contestGlobalRanking || 0,
          totalParticipants: contestData.totalParticipants || 0,
          topPercentile: contestData.contestTopPercentage || 0,
          attended: contestData.contestAttend || 0,
          history: (contestData.contestParticipation || [])
            .filter((h: any) => h.attended)
            .map((h: any) => ({
              rating: Math.round(h.rating || 0),
              date: new Date((h.contest?.startTime || 0) * 1000).toISOString(),
            })),
        } : null,
      };
    } catch (err) {
      logger.error({ username, err }, "Error fetching LeetCode stats from alfa-leetcode-api");
      return null;
    }
  }
}
