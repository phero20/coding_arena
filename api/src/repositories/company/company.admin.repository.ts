import { MongoBaseRepository } from "../base.repository";
import {
  CompanyModel,
  type CompanyDocument,
  type Company,
} from "../../mongo/models/company.model";
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../../types/company/company.admin.types";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { sql } from "drizzle-orm";
import { ProblemModel } from "../../mongo/models/problem.model";

export interface ICompanyAdminRepository {
  createCompany(payload: CreateCompanyPayload): Promise<Company>;
  getAllCompanies(): Promise<Company[]>;
  findBySlug(slug: string): Promise<Company | null>;
  updateCompany(
    id: string,
    payload: UpdateCompanyPayload,
  ): Promise<Company | null>;
  deleteCompany(id: string): Promise<void>;
  getStats(): Promise<any>;
}

export class CompanyAdminRepository
  extends MongoBaseRepository<Company, CompanyDocument>
  implements ICompanyAdminRepository
{
  constructor() {
    super(CompanyModel);
  }

  async createCompany(payload: CreateCompanyPayload): Promise<Company> {
    const doc = await this.model.create(payload as any);
    return this.toDomain(doc) as Company;
  }

  async getAllCompanies(): Promise<Company[]> {
    const docs = await this.model.find().sort({ name: 1 }).lean().exec();
    return this.toDomainArray(docs as any[]);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const doc = await this.model.findOne({ slug }).lean().exec();
    return this.toDomain(doc as any);
  }

  async updateCompany(
    id: string,
    payload: UpdateCompanyPayload,
  ): Promise<Company | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: payload }, { new: true })
      .lean()
      .exec();
    return this.toDomain(doc as any);
  }

  async deleteCompany(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async getStats(): Promise<any> {
    const companies = await this.model
      .find({}, { name: 1, problem_ids: 1 })
      .lean()
      .exec();
    const companiesCount = companies.length;

    const problems = await ProblemModel.find(
      {},
      { problem_id: 1, difficulty: 1 },
    )
      .lean()
      .exec();

    const problemDifficultyMap = new Map<string, string>();
    problems.forEach((p: any) => {
      if (p.problem_id && p.difficulty) {
        problemDifficultyMap.set(p.problem_id, p.difficulty.toLowerCase());
      }
    });

    const totalDifficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    const allCompanyProblemIds = new Set<string>();

    for (const c of companies as any[]) {
      if (c.problem_ids) {
        for (const pid of c.problem_ids) {
          allCompanyProblemIds.add(pid);
        }
      }
    }

    const totalQuestions = allCompanyProblemIds.size;

    allCompanyProblemIds.forEach((pid) => {
      const diff = problemDifficultyMap.get(pid);
      if (diff === "easy") totalDifficultyBreakdown.easy++;
      else if (diff === "medium") totalDifficultyBreakdown.medium++;
      else if (diff === "hard") totalDifficultyBreakdown.hard++;
    });

    const solvedRecords = await db
      .select({
        problemId: schema.userSolvedProblems.problemId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.userSolvedProblems)
      .groupBy(schema.userSolvedProblems.problemId);

    const solveCountMap = new Map<string, number>();
    solvedRecords.forEach((r) => {
      solveCountMap.set(r.problemId, r.count);
    });

    const topCompaniesBySolves = (companies as any[])
      .map((c) => {
        let totalSolves = 0;
        if (c.problem_ids) {
          for (const pid of c.problem_ids) {
            totalSolves += solveCountMap.get(pid) || 0;
          }
        }
        return {
          name: c.name,
          totalSolves,
        };
      })
      .sort((a, b) => b.totalSolves - a.totalSolves);

    const solvedDifficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    allCompanyProblemIds.forEach((pid) => {
      const solves = solveCountMap.get(pid) || 0;
      if (solves > 0) {
        const diff = problemDifficultyMap.get(pid);
        if (diff === "easy") solvedDifficultyBreakdown.easy += solves;
        else if (diff === "medium") solvedDifficultyBreakdown.medium += solves;
        else if (diff === "hard") solvedDifficultyBreakdown.hard += solves;
      }
    });

    return {
      companies: companiesCount,
      totalQuestions,
      topCompaniesBySolves,
      totalDifficultyBreakdown,
      solvedDifficultyBreakdown,
    };
  }
}
