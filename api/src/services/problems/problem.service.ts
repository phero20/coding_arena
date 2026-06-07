import type { Problem } from "../../mongo/models/problem.model";
import type {
  CreateOrUpdateProblemInput,
  IProblemRepository,
} from "../../repositories/problems/problem.repository";

export interface IProblemService {
  getProblemBySlug(slug: string): Promise<Problem | null>;
  getProblemById(problem_id: string): Promise<Problem | null>;
  searchByTopic(topic: string, limit?: number): Promise<Problem[]>;
  getAllProblems(
    page: number,
    limit: number,
    filters?: { search?: string; difficulty?: string; topic?: string }
  ): Promise<{ problems: Problem[] }>;
  upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem>;
  getUserSolvedProblems(userId: string): Promise<string[]>;
}

import { type ICradle } from "../../libs/awilix-container";

export class ProblemService implements IProblemService {
  private readonly problemRepository: IProblemRepository;

  constructor({ problemRepository }: ICradle) {
    this.problemRepository = problemRepository;
  }

  getProblemBySlug(slug: string): Promise<Problem | null> {
    return this.problemRepository.findBySlug(slug);
  }

  getProblemById(problem_id: string): Promise<Problem | null> {
    return this.problemRepository.findByProblemId(problem_id);
  }

  searchByTopic(topic: string, limit?: number): Promise<Problem[]> {
    return this.problemRepository.searchByTopic(topic, limit);
  }

  getAllProblems(
    page: number,
    limit: number,
    filters?: { search?: string; difficulty?: string; topic?: string }
  ): Promise<{ problems: Problem[] }> {
    return this.problemRepository.findPaginated(page, limit, filters);
  }

  upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem> {
    return this.problemRepository.createOrUpdate(input);
  }

  getUserSolvedProblems(userId: string): Promise<string[]> {
    return this.problemRepository.getUserSolvedProblems(userId);
  }
}
