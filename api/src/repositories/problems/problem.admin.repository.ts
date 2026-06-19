import { MongoBaseRepository } from "../base.repository";
import { ProblemModel, type ProblemDocument } from "../../mongo/models/problem.model";
import type { Problem } from "../../types/problems/problem.types";
import type { CreateAdminProblemPayload, UpdateAdminProblemPayload } from "../../types/problems/problem.admin.types";
import { type ICradle } from "../../libs/awilix-container";

export interface IProblemAdminRepository {
  createProblem(payload: CreateAdminProblemPayload): Promise<Problem>;
  updateProblem(id: string, payload: UpdateAdminProblemPayload): Promise<Problem | null>;
  deleteProblem(id: string): Promise<void>;
  getProblemById(id: string): Promise<Problem | null>;
  getAllPaginated(page: number, limit: number, search?: string): Promise<{ data: Problem[], total: number }>;
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

  async updateProblem(id: string, payload: UpdateAdminProblemPayload): Promise<Problem | null> {
    const doc = await this.model.findOneAndUpdate({ problem_id: id }, { $set: payload }, { new: true }).lean().exec();
    return this.toDomain(doc as any);
  }

  async deleteProblem(id: string): Promise<void> {
    await this.model.findOneAndDelete({ problem_id: id }).exec();
  }

  async getProblemById(id: string): Promise<Problem | null> {
    const doc = await this.model.findOne({ problem_id: id }).lean().exec();
    return doc ? this.toDomain(doc as any) : null;
  }

  async getAllPaginated(page: number, limit: number, search?: string): Promise<{ data: Problem[], total: number }> {
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
      this.model.countDocuments(query).exec()
    ]);

    return {
      data: this.toDomainArray(docs as any[]),
      total
    };
  }
}
