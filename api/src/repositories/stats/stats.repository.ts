import { db, schema } from "../../db";
import { sql, eq, desc } from "drizzle-orm";
import { type UpdateStatsInput } from "../../validators/stats/stats.validator";
import { type ICradle } from "../../libs/awilix-container";
import { type IClockService } from "../../services/common/clock.service";

import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("stats-repository");

export interface IStatsRepository {
  updateUserStats(input: Omit<UpdateStatsInput, 'isWin'>): Promise<any>;
  updateLanguageCount(userId: string, languageId: string): Promise<any>;
  updateStreak(userId: string): Promise<any>;
  logActivity(userId: string, points: number, arenaPoints: number, isSubmission: boolean, isMatch: boolean): Promise<any>;
  getTopUsers(limit?: number, offset?: number): Promise<any>;
  getUserStats(userId: string): Promise<any>;
  getUserActivityLog(userId: string): Promise<any>;
  recordSolvedProblem(userId: string, problemId: string): Promise<boolean>;
  recordSolvedLanguage(userId: string, problemId: string, languageId: string): Promise<boolean>;
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
    const { userId, points, arenaPoints, difficulty, isMatch } = input;

    return await db
      .insert(schema.userStats)
      .values({
        userId,
        totalPoints: points,
        arenaPoints: arenaPoints || 0,
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
          arenaPoints: arenaPoints ? sql`${schema.userStats.arenaPoints} + ${arenaPoints}` : schema.userStats.arenaPoints,
          totalSolved: difficulty ? sql`${schema.userStats.totalSolved} + 1` : schema.userStats.totalSolved,
          easySolved: difficulty === 'easy' ? sql`${schema.userStats.easySolved} + 1` : schema.userStats.easySolved,
          mediumSolved: difficulty === 'medium' ? sql`${schema.userStats.mediumSolved} + 1` : schema.userStats.mediumSolved,
          hardSolved: difficulty === 'hard' ? sql`${schema.userStats.hardSolved} + 1` : schema.userStats.hardSolved,
          arenaGames: isMatch ? sql`${schema.userStats.arenaGames} + 1` : schema.userStats.arenaGames,
        },
<<<<<<< HEAD
      });
=======
      })
      .returning();
>>>>>>> prod-deploy
  }

  /**
   * Atomically increments the language solve counter for a specific language.
   * Uses jsonb_build_object + || merge so Drizzle parameterizes all values safely.
   */
  async updateLanguageCount(userId: string, languageId: string) {
    const lang = languageId.toLowerCase();
    logger.info({ userId, lang }, "Updating language count in Postgres using jsonb_set...");
    
    // Using jsonb_set is the most robust way to update a single key in a JSONB object in Postgres.
    // path: ARRAY[lang]
    // value: (current_count + 1) cast to jsonb
    // create_if_missing: true
    const result = await db.update(schema.userStats)
      .set({
        languageCounts: sql`jsonb_set(
          COALESCE(${schema.userStats.languageCounts}, '{}'::jsonb),
          ARRAY[${lang}],
          (COALESCE((${schema.userStats.languageCounts}->>${lang})::int, 0) + 1)::text::jsonb,
          true
        )`
      })
      .where(eq(schema.userStats.userId, userId))
      .returning();

    logger.info({ userId, lang, updated: result.length > 0 }, "Language count update complete");
    return result;
  }

  /**
   * Updates solve streaks (Current & Best) based on activity timing.
   * - If solved yesterday: increment streak.
   * - If not solved today/yesterday: reset streak to 1.
   * - If already solved today: no change.
   */
  async updateStreak(userId: string) {
    const todayStr = this.clock.nowDate().toISOString().split('T')[0];
    
    logger.info({ userId, todayStr }, "Updating solve streak...");

    // Atomic update logic:
    // 1. If last_solve_date is today -> do nothing.
    // 2. If last_solve_date is yesterday -> current_streak + 1.
    // 3. Otherwise -> current_streak = 1.
    // 4. best_streak = GREATEST(current_streak, best_streak)
    
    const result = await db.insert(schema.userStats)
      .values({
        userId,
        currentStreak: 1,
        bestStreak: 1,
        lastSolveDate: todayStr
      })
      .onConflictDoUpdate({
        target: schema.userStats.userId,
        set: {
          currentStreak: sql`
            CASE 
              WHEN ${schema.userStats.lastSolveDate} = ${todayStr} THEN ${schema.userStats.currentStreak}
              WHEN ${schema.userStats.lastSolveDate} = (${todayStr}::date - interval '1 day')::date THEN ${schema.userStats.currentStreak} + 1
              ELSE 1 
            END
          `,
          bestStreak: sql`
            GREATEST(
              ${schema.userStats.bestStreak},
              CASE 
                WHEN ${schema.userStats.lastSolveDate} = ${todayStr} THEN ${schema.userStats.currentStreak}
                WHEN ${schema.userStats.lastSolveDate} = (${todayStr}::date - interval '1 day')::date THEN ${schema.userStats.currentStreak} + 1
                ELSE 1 
              END
            )
          `,
          lastSolveDate: todayStr
        }
      })
      .returning();

    return result;
  }

  /**
   * Logs daily activity for the GitHub-style contribution graph.
   * Uses an upsert pattern to handle multiple activities in a single day.
   */
  async logActivity(userId: string, points: number, arenaPoints: number, isSubmission: boolean, isMatch: boolean) {
    const today = this.clock.nowDate().toISOString().split('T')[0];

    return await db
      .insert(schema.userActivity)
      .values({
        userId,
        date: today,
        pointsEarned: points,
        arenaPointsEarned: arenaPoints || 0,
        submissions: isSubmission ? 1 : 0,
        matches: isMatch ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [schema.userActivity.userId, schema.userActivity.date],
        set: {
          pointsEarned: sql`${schema.userActivity.pointsEarned} + ${points}`,
          arenaPointsEarned: arenaPoints ? sql`${schema.userActivity.arenaPointsEarned} + ${arenaPoints}` : schema.userActivity.arenaPointsEarned,
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
   * Fetches the performance stats for a specific user.
   */
  async getUserStats(userId: string) {
    const [stats] = await db
      .select()
      .from(schema.userStats)
      .where(eq(schema.userStats.userId, userId))
      .limit(1);
    return stats ?? null;
  }

  /**
   * Fetches the full activity log for a user.
   */
  async getUserActivityLog(userId: string) {
    return await db
      .select()
      .from(schema.userActivity)
      .where(eq(schema.userActivity.userId, userId))
      .orderBy(desc(schema.userActivity.date));
  }

  /**
   * Records a problem as solved for a user.
   * Returns true if it was newly solved, false if they had already solved it.
   */
  async recordSolvedProblem(userId: string, problemId: string): Promise<boolean> {
    const result = await db
      .insert(schema.userSolvedProblems)
      .values({ userId, problemId })
      .onConflictDoNothing()
      .returning();

    return result.length > 0;
  }

  /**
   * Records a (problem, language) pair as solved for a user.
   * Returns true only the first time this user solves this problem in this specific language.
   * This is the atomic dedup gate that guards the language counter.
   */
  async recordSolvedLanguage(userId: string, problemId: string, languageId: string): Promise<boolean> {
    const lang = languageId.toLowerCase();
    logger.info({ userId, problemId, lang }, "Recording unique solve for language...");
    const result = await db
      .insert(schema.userSolvedLanguages)
      .values({ userId, problemId, languageId: lang })
      .onConflictDoNothing()
      .returning();

    const isNew = result.length > 0;
    logger.info({ userId, problemId, lang, isNew }, "Solve language recording complete");
    return isNew;
  }
}
