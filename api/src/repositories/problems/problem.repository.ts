import { MongoBaseRepository } from "../base.repository";
import { ProblemModel } from "../../mongo/models/problem.model";
import type {
  Problem,
  CreateOrUpdateProblemInput,
} from "../../types/problems/problem.types";
import type { ProblemDocument } from "../../mongo/models/problem.model";

// Re-export for external consumers to avoid importing from model
export type { CreateOrUpdateProblemInput } from "../../types/problems/problem.types";

export interface IProblemRepository {
  findByProblemId(problem_id: string): Promise<Problem | null>;
  findById(id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
  searchByTopic(topic: string, limit?: number): Promise<Problem[]>;
  findPaginated(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }>;
  createOrUpdate(data: CreateOrUpdateProblemInput): Promise<Problem>;
}

import { type ICradle } from "../../libs/awilix-container";

export class ProblemRepository
  extends MongoBaseRepository<Problem, ProblemDocument>
  implements IProblemRepository
{
  constructor(_: ICradle) {
    super(ProblemModel);
  }

  async findByProblemId(problem_id: string): Promise<Problem | null> {
    const doc = await this.model.findOne({ problem_id }).lean().exec();
    return this.toDomain(doc as any);
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const doc = await this.model.findOne({ problem_slug: slug }).lean().exec();
    return this.toDomain(doc as any);
  }

  async searchByTopic(topic: string, limit = 20): Promise<Problem[]> {
    const docs = await this.model
      .find({ topics: topic })
      .limit(limit)
      .lean()
      .exec();
    return this.toDomainArray(docs as any);
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }> {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find()
        .sort({ problem_id: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(),
    ]);

    return {
      problems: this.toDomainArray(docs),
      total,
    };
  }

  async createOrUpdate(data: CreateOrUpdateProblemInput): Promise<Problem> {
    const doc = await this.model
      .findOneAndUpdate(
        { problem_id: data.problem_id },
        {
          $set: {
            ...data,
            topics: data.topics ?? [],
            examples: data.examples ?? [],
            constraints: data.constraints ?? [],
            follow_ups: data.follow_ups ?? [],
            hints: data.hints ?? [],
            code_snippets: data.code_snippets ?? {},
          },
        },
        {
          returnDocument: "after",
          upsert: true,
        },
      )
      .exec();

    const problem = this.toDomain(doc);
    if (!problem) {
      throw new Error("Failed to create or update problem");
    }
    return problem;
  }
}
