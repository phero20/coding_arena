import { db } from "../../db";
import { users, userStats, userActivity, userSolvedProblems, userAcademyExercises, userSolvedLanguages, solutions } from "../../db/schema";
import { eq, desc, and, count, countDistinct, sql } from "drizzle-orm";
import { SubmissionModel } from "../../mongo/models/submission.model";
import { ArenaMatchModel } from "../../mongo/models/arena-match.model";
import { ArenaSubmissionModel } from "../../mongo/models/arena-submission.model";

export class UserAdminRepository {
  async findAll() {
    return db.select().from(users).orderBy(desc(users.createdAt)).execute();
  }

  async create(data: any) {
    const [user] = await db.insert(users).values(data).returning().execute();
    return user;
  }

  async update(id: string, data: any) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
      .execute();
    return user;
  }

  async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning().execute();
    return user;
  }

  async findStatsByUserId(userId: string) {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId)).execute();
    return stats;
  }

  async createStats(data: any) {
    const [stats] = await db.insert(userStats).values(data).returning().execute();
    return stats;
  }

  async getCounts() {
    const [
      usersCount,
      solvedProblemsCount,
      solvedLanguagesCount,
      academyExercisesCount,
      solutionsCount,
      totalSubmissionsCount,
      arenaMatchesCount,
      arenaSubmissionsCount,
    ] = await Promise.all([
      db.select({ count: count() }).from(users).then((res) => res[0]?.count || 0),
      db.select({ count: countDistinct(userSolvedProblems.problemId) }).from(userSolvedProblems).then((res) => res[0]?.count || 0),
      db.select({ count: countDistinct(userSolvedLanguages.languageId) }).from(userSolvedLanguages).then((res) => res[0]?.count || 0),
      db.select({ count: countDistinct(sql`${userAcademyExercises.trackSlug} || '-' || ${userAcademyExercises.exerciseSlug}`) }).from(userAcademyExercises).then((res) => res[0]?.count || 0),
      db.select({ count: count() }).from(solutions).then((res) => res[0]?.count || 0),
      SubmissionModel.countDocuments(),
      ArenaMatchModel.countDocuments(),
      ArenaSubmissionModel.countDocuments(),
    ]);

    return {
      users: usersCount,
      userSolvedProblems: solvedProblemsCount,
      userSolvedLanguages: solvedLanguagesCount,
      userAcademyExercises: academyExercisesCount,
      solutions: solutionsCount,
      totalSubmissions: totalSubmissionsCount,
      arenaMatches: arenaMatchesCount,
      arenaSubmissions: arenaSubmissionsCount,
    };
  }

  async updateStats(userId: string, data: any) {
    const [stats] = await db
      .update(userStats)
      .set(data)
      .where(eq(userStats.userId, userId))
      .returning()
      .execute();
    return stats;
  }

  async deleteStats(userId: string) {
    const [stats] = await db.delete(userStats).where(eq(userStats.userId, userId)).returning().execute();
    return stats;
  }

  async findActivityByUserId(userId: string) {
    return db.select().from(userActivity).where(eq(userActivity.userId, userId)).orderBy(desc(userActivity.date)).execute();
  }

  async createActivity(data: any) {
    const [activity] = await db.insert(userActivity).values(data).returning().execute();
    return activity;
  }

  async updateActivity(userId: string, date: string, data: any) {
    const [activity] = await db
      .update(userActivity)
      .set(data)
      .where(and(eq(userActivity.userId, userId), eq(userActivity.date, date)))
      .returning()
      .execute();
    return activity;
  }

  async deleteActivity(userId: string, date: string) {
    const [activity] = await db.delete(userActivity).where(and(eq(userActivity.userId, userId), eq(userActivity.date, date))).returning().execute();
    return activity;
  }

  async findSolvedProblemsByUserId(userId: string) {
    return db.select().from(userSolvedProblems).where(eq(userSolvedProblems.userId, userId)).orderBy(desc(userSolvedProblems.solvedAt)).execute();
  }

  async createSolvedProblem(data: any) {
    const [solved] = await db.insert(userSolvedProblems).values(data).returning().execute();
    return solved;
  }

  async deleteSolvedProblem(userId: string, problemId: string) {
    const [solved] = await db.delete(userSolvedProblems).where(and(eq(userSolvedProblems.userId, userId), eq(userSolvedProblems.problemId, problemId))).returning().execute();
    return solved;
  }

  async findAcademyExercisesByUserId(userId: string) {
    return db.select().from(userAcademyExercises).where(eq(userAcademyExercises.userId, userId)).orderBy(desc(userAcademyExercises.solvedAt)).execute();
  }

  async createAcademyExercise(data: any) {
    const [exercise] = await db.insert(userAcademyExercises).values(data).returning().execute();
    return exercise;
  }

  async deleteAcademyExercise(userId: string, trackSlug: string, exerciseSlug: string) {
    const [exercise] = await db.delete(userAcademyExercises).where(and(eq(userAcademyExercises.userId, userId), eq(userAcademyExercises.trackSlug, trackSlug), eq(userAcademyExercises.exerciseSlug, exerciseSlug))).returning().execute();
    return exercise;
  }

  async findSolvedLanguagesByUserId(userId: string) {
    return db.select().from(userSolvedLanguages).where(eq(userSolvedLanguages.userId, userId)).orderBy(desc(userSolvedLanguages.solvedAt)).execute();
  }

  async createSolvedLanguage(data: any) {
    const [solvedLanguage] = await db.insert(userSolvedLanguages).values(data).returning().execute();
    return solvedLanguage;
  }

  async deleteSolvedLanguage(userId: string, problemId: string, languageId: string) {
    const [solvedLanguage] = await db.delete(userSolvedLanguages).where(and(eq(userSolvedLanguages.userId, userId), eq(userSolvedLanguages.problemId, problemId), eq(userSolvedLanguages.languageId, languageId))).returning().execute();
    return solvedLanguage;
  }

  async findSolutionsByUserId(userId: string) {
    return db.select().from(solutions).where(eq(solutions.userId, userId)).orderBy(desc(solutions.createdAt)).execute();
  }

  async deleteSolution(userId: string, solutionId: string) {
    const [solution] = await db.delete(solutions).where(and(eq(solutions.userId, userId), eq(solutions.id, solutionId))).returning().execute();
    return solution;
  }
}
