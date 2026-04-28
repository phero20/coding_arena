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
  ): Promise<{ problems: Problem[]; total: number }>;
  upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem>;
}

import { type ICradle } from "../../libs/awilix-container";
import {
  validateServiceInput,
  GetProblemsSchema,
} from "../validation/problem.validator";

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
  ): Promise<{ problems: Problem[]; total: number }> {
    return this.problemRepository.findPaginated(page, limit);
  }

  upsertProblem(input: CreateOrUpdateProblemInput): Promise<Problem> {
    return this.problemRepository.createOrUpdate(input);
  }
}
