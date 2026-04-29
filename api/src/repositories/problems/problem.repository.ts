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
  findManyByProblemIds(problem_ids: string[]): Promise<Problem[]>;
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

  /**
   * Batch fetch problems by IDs — single $in query instead of N queries.
   * Preserves the original order of the input IDs.
   */
  async findManyByProblemIds(problem_ids: string[]): Promise<Problem[]> {
    if (problem_ids.length === 0) return [];
    const docs = await this.model
      .find({ problem_id: { $in: problem_ids } })
      // Projection: only fetch fields needed for list/category views
      .select('problem_id frontend_id title difficulty problem_slug topics')
      .lean()
      .exec();
    // Restore the original ordered sequence from the junction table
    const docMap = new Map(docs.map((d: any) => [d.problem_id, d]));
    return problem_ids
      .map((id) => this.toDomain(docMap.get(id) as any))
      .filter((p): p is Problem => p !== null);
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
      // estimatedDocumentCount uses collection metadata — near-instant vs full scan
      this.model.estimatedDocumentCount(),
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
