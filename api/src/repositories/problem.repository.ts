import { MongoBaseRepository } from './base.repository'
import { ProblemModel } from '../mongo/models/problem.model'
import type { Problem, CreateOrUpdateProblemInput } from '../types/problem.types'
import type { ProblemDocument } from '../mongo/models/problem.model'

// Re-export for external consumers to avoid importing from model
export type { CreateOrUpdateProblemInput } from '../types/problem.types'

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

export class ProblemRepository 
  extends MongoBaseRepository<Problem, ProblemDocument> 
  implements IProblemRepository 
{
  constructor() {
    super(ProblemModel);
  }

  async findByProblemId(problem_id: string): Promise<Problem | null> {
    const doc = await this.model.findOne({ problem_id }).exec();
    return this.toDomain(doc);
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const doc = await this.model.findOne({ problem_slug: slug }).exec();
    return this.toDomain(doc);
  }

  async searchByTopic(topic: string, limit = 20): Promise<Problem[]> {
    const docs = await this.model.find({ topics: topic }).limit(limit).exec();
    return this.toDomainArray(docs);
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }> {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model.find()
        .sort({ problem_id: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(),
    ]);

    return {
      problems: this.toDomainArray(docs),
      total,
    };
  }

  async createOrUpdate(data: CreateOrUpdateProblemInput): Promise<Problem> {
    const doc = await this.model.findOneAndUpdate(
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
    ).exec();

    const problem = this.toDomain(doc);
    if (!problem) {
      throw new Error("Failed to create or update problem");
    }
    return problem;
  }
}
