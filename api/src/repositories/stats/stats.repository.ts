import { db, schema } from "../../db";
import { sql } from "drizzle-orm";
import { type UpdateStatsInput } from "../../validators/stats/stats.validator";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../../services/common/clock.service";

export interface IStatsRepository {
  updateUserStats(input: Omit<UpdateStatsInput, 'isWin'>): Promise<any>;
  logActivity(userId: string, points: number, isSubmission: boolean, isMatch: boolean): Promise<any>;
  getTopUsers(limit?: number, offset?: number): Promise<any>;
  recordSolvedProblem(userId: string, problemId: string): Promise<boolean>;
}

export class StatsRepository implements IStatsRepository {
  private readonly clock: IClockService;

  constructor({ clockService }: ICradle) {
    this.clock = clockService;
  }

  /**
   * High-performance atomic update for user performance metrics.
   * Increments points, solved counts, and match stats in one go.
   */
  async updateUserStats(input: Omit<UpdateStatsInput, 'isWin'>) {
    const { userId, points, difficulty, isMatch } = input;

    return await db
      .insert(schema.userStats)
      .values({
        userId,
        totalPoints: points,
        totalSolved: difficulty ? 1 : 0,
        easySolved: difficulty === 'easy' ? 1 : 0,
        mediumSolved: difficulty === 'medium' ? 1 : 0,
        hardSolved: difficulty === 'hard' ? 1 : 0,
        arenaGames: isMatch ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: schema.userStats.userId,
        set: {
          totalPoints: sql`${schema.userStats.totalPoints} + ${points}`,
          totalSolved: difficulty ? sql`${schema.userStats.totalSolved} + 1` : schema.userStats.totalSolved,
          easySolved: difficulty === 'easy' ? sql`${schema.userStats.easySolved} + 1` : schema.userStats.easySolved,
          mediumSolved: difficulty === 'medium' ? sql`${schema.userStats.mediumSolved} + 1` : schema.userStats.mediumSolved,
          hardSolved: difficulty === 'hard' ? sql`${schema.userStats.hardSolved} + 1` : schema.userStats.hardSolved,
          arenaGames: isMatch ? sql`${schema.userStats.arenaGames} + 1` : schema.userStats.arenaGames,
        },
      });
  }

  /**
   * Logs daily activity for the GitHub-style contribution graph.
   * Uses an upsert pattern to handle multiple activities in a single day.
   */
  async logActivity(userId: string, points: number, isSubmission: boolean, isMatch: boolean) {
    const today = this.clock.nowDate().toISOString().split('T')[0];

    return await db
      .insert(schema.userActivity)
      .values({
        userId,
        date: today,
        pointsEarned: points,
        submissions: isSubmission ? 1 : 0,
        matches: isMatch ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [schema.userActivity.userId, schema.userActivity.date],
        set: {
          pointsEarned: sql`${schema.userActivity.pointsEarned} + ${points}`,
          submissions: isSubmission ? sql`${schema.userActivity.submissions} + 1` : schema.userActivity.submissions,
          matches: isMatch ? sql`${schema.userActivity.matches} + 1` : schema.userActivity.matches,
        },
      });
  }

  /**
   * Fetches the top users for the global leaderboard.
   */
  /**
   * Fetches the top users for the global leaderboard.
   */
  async getTopUsers(limit: number = 50, offset: number = 0) {
    return await db.query.userStats.findMany({
      limit,
      offset,
      orderBy: (stats, { desc }) => [desc(stats.totalPoints)],
    });
  }

  /**
   * Records a problem as solved for a user.
   * Returns true if it was newly solved, false if they had already solved it.
   */
  async recordSolvedProblem(userId: string, problemId: string): Promise<boolean> {
    const result = await db.execute(sql`
      INSERT INTO ${schema.userSolvedProblems} (user_id, problem_id)
      VALUES (${userId}, ${problemId})
      ON CONFLICT DO NOTHING
      RETURNING *
    `);

    // If result.rows.length > 0, a new record was inserted.
    return result.rows.length > 0;
  }
}
