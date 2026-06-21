import { db, schema } from "../../db";
import { sql } from "drizzle-orm";
import { MongoBaseRepository } from "../base.repository";
import {
  ProblemModel,
  type ProblemDocument,
} from "../../mongo/models/problem.model";
import { ProblemTestModel } from "../../mongo/models/problem-test.model";
import { SubmissionModel } from "../../mongo/models/submission.model";
import type { Problem } from "../../types/problems/problem.types";
import type {
  CreateAdminProblemPayload,
  UpdateAdminProblemPayload,
} from "../../types/problems/problem.admin.types";
import { type ICradle } from "../../libs/awilix-container";

export interface IProblemAdminRepository {
  createProblem(payload: CreateAdminProblemPayload): Promise<Problem>;
  updateProblem(
    id: string,
    payload: UpdateAdminProblemPayload,
  ): Promise<Problem | null>;
  deleteProblem(id: string): Promise<void>;
  getProblemById(id: string): Promise<Problem | null>;
  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: Problem[]; total: number }>;
  getStats(): Promise<{ 
    problems: number; 
    testcases: number;
    difficulty: { easy: number; medium: number; hard: number; total: number };
    userSolvedProblems: { easy: number; medium: number; hard: number; total: number };
    userSolvedLanguages: Record<string, number>;
    totalSubmissions: number;
    submissionStatus: Record<string, number>;
  }>;
}

export class ProblemAdminRepository
  extends MongoBaseRepository<Problem, ProblemDocument>
  implements IProblemAdminRepository
{
  constructor(cradle: ICradle) {
    super(ProblemModel);
  }

  async createProblem(payload: CreateAdminProblemPayload): Promise<Problem> {
    const doc = await this.model.create(payload);
    return this.toDomain(doc) as Problem;
  }

  async updateProblem(
    id: string,
    payload: UpdateAdminProblemPayload,
  ): Promise<Problem | null> {
    const doc = await this.model
      .findOneAndUpdate({ problem_id: id }, { $set: payload }, { new: true })
      .lean()
      .exec();
    return this.toDomain(doc as any);
  }

  async deleteProblem(id: string): Promise<void> {
    await this.model.findOneAndDelete({ problem_id: id }).exec();
  }

  async getProblemById(id: string): Promise<Problem | null> {
    const doc = await this.model.findOne({ problem_id: id }).lean().exec();
    return doc ? this.toDomain(doc as any) : null;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: Problem[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { problem_slug: { $regex: searchRegex } },
        { problem_id: search },
      ];
    }

    const [docs, total] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit).lean().exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      data: this.toDomainArray(docs as any[]),
      total,
    };
  }

  async getStats(): Promise<{ 
    problems: number; 
    testcases: number;
    difficulty: { easy: number; medium: number; hard: number; total: number };
    userSolvedProblems: { easy: number; medium: number; hard: number; total: number };
    userSolvedLanguages: Record<string, number>;
    totalSubmissions: number;
    submissionStatus: Record<string, number>;
  }> {
    const [problems, testcases, difficultyAgg, solvedProblemsRaw, solvedLanguagesRaw, academySolvesRaw, submissionStatusAgg] = await Promise.all([
      this.model.countDocuments(),
      ProblemTestModel.countDocuments(),
      this.model.aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
      ]).exec(),
      db.select({ problemId: schema.userSolvedProblems.problemId, count: sql<number>`cast(count(*) as integer)` })
        .from(schema.userSolvedProblems)
        .groupBy(schema.userSolvedProblems.problemId),
      db.select({ languageId: schema.userSolvedLanguages.languageId, count: sql<number>`cast(count(*) as integer)` })
        .from(schema.userSolvedLanguages)
        .groupBy(schema.userSolvedLanguages.languageId),
      db.select({ trackSlug: schema.userAcademyExercises.trackSlug, count: sql<number>`cast(count(*) as integer)` })
        .from(schema.userAcademyExercises)
        .groupBy(schema.userAcademyExercises.trackSlug),
      SubmissionModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]).exec(),
    ]);

    const difficulty = { easy: 0, medium: 0, hard: 0, total: 0 };
    for (const item of difficultyAgg) {
      if (item._id === 'Easy') difficulty.easy = item.count;
      if (item._id === 'Medium') difficulty.medium = item.count;
      if (item._id === 'Hard') difficulty.hard = item.count;
    }
    difficulty.total = difficulty.easy + difficulty.medium + difficulty.hard;

    const userSolvedLanguages: Record<string, number> = {};
    for (const row of solvedLanguagesRaw) {
      userSolvedLanguages[row.languageId] = row.count;
    }

    for (const row of academySolvesRaw) {
      if (userSolvedLanguages[row.trackSlug]) {
        userSolvedLanguages[row.trackSlug] -= row.count;
        if (userSolvedLanguages[row.trackSlug] <= 0) {
          delete userSolvedLanguages[row.trackSlug];
        }
      }
    }

    const problemIds = solvedProblemsRaw.map(r => r.problemId);
    const mongoProblems = await this.model.find(
      { problem_id: { $in: problemIds } },
      { problem_id: 1, difficulty: 1, _id: 0 }
    ).lean();
    
    const difficultyMap = new Map<string, string>(
      mongoProblems.map((p: any) => [p.problem_id, p.difficulty])
    );

    const userSolvedProblems = { easy: 0, medium: 0, hard: 0, total: 0 };
    for (const item of solvedProblemsRaw) {
      const diff = difficultyMap.get(item.problemId);
      if (diff === 'Easy') userSolvedProblems.easy += item.count;
      else if (diff === 'Medium') userSolvedProblems.medium += item.count;
      else if (diff === 'Hard') userSolvedProblems.hard += item.count;
      userSolvedProblems.total += item.count;
    }

    const submissionStatus: Record<string, number> = {};
    let totalSubmissions = 0;
    for (const item of submissionStatusAgg) {
      submissionStatus[item._id] = item.count;
      totalSubmissions += item.count;
    }

    return { 
      problems, 
      testcases, 
      difficulty, 
      userSolvedProblems, 
      userSolvedLanguages,
      totalSubmissions,
      submissionStatus
    };
  }
}
