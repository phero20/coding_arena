import type { Problem, ProblemDocument } from "../mongo/models/problem.model";

import { ProblemModel } from "../mongo/models/problem.model";

export interface CreateOrUpdateProblemInput {
  title: string;
  problem_id: string;
  frontend_id?: string;
  difficulty: Problem["difficulty"];
  problem_slug: string;
  topics?: string[];
  description: string;
  examples?: Problem["examples"];
  constraints?: string[];
  follow_ups?: string[];
  hints?: string[];
  code_snippets?: Problem["code_snippets"];
  solutions?: string;
}

export interface IProblemRepository {
  findByProblemId(problem_id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
  searchByTopic(topic: string, limit?: number): Promise<Problem[]>;
  findPaginated(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }>;
  createOrUpdate(data: CreateOrUpdateProblemInput): Promise<Problem>;
}

export class ProblemRepository implements IProblemRepository {
  private toProblem(doc: ProblemDocument | null): Problem | null {
    if (!doc) return null;
    const json = doc.toJSON() as any;
    delete json.__v;
    return json as Problem;
  }

  async findByProblemId(problem_id: string): Promise<Problem | null> {
    const doc = await ProblemModel.findOne({ problem_id }).exec();
    return this.toProblem(doc);
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const doc = await ProblemModel.findOne({ problem_slug: slug }).exec();
    return this.toProblem(doc);
  }

  async searchByTopic(topic: string, limit = 20): Promise<Problem[]> {
    const docs = await ProblemModel.find({ topics: topic }).limit(limit).exec();
    return docs.map((d) => this.toProblem(d)!) as Problem[];
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<{ problems: Problem[]; total: number }> {
    const skip = (page - 1) * limit;

    // We use a regular expression check to see if we can sort numerically
    // but since problem_id is a string, we'll just sort by it normally first.
    // If you want true numeric sort, you might need a separate numeric field.
    const [docs, total] = await Promise.all([
      ProblemModel.find()
        .sort({ problem_id: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ProblemModel.countDocuments(),
    ]);

    return {
      problems: docs.map((d) => this.toProblem(d)!) as Problem[],
      total,
    };
  }

  async createOrUpdate(data: CreateOrUpdateProblemInput): Promise<Problem> {
    const doc = await ProblemModel.findOneAndUpdate(
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

    const problem = this.toProblem(doc);
    if (!problem) {
      throw new Error("Failed to create or update problem");
    }
    return problem;
  }
}
