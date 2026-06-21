import { type IProblemAdminRepository } from "../../repositories/problems/problem.admin.repository";
import { type IProblemTestRepository, type UpsertProblemTestInput } from "../../repositories/problems/problem-test.repository";
import type { Problem, ProblemTest } from "../../types/problems/problem.types";
import type { CreateAdminProblemPayload, UpdateAdminProblemPayload } from "../../types/problems/problem.admin.types";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import { ERRORS } from "../../constants/errors";

export interface IProblemAdminService {
  getAllPaginated(page: number, limit: number, search?: string): Promise<{ data: Problem[], total: number }>;
  createProblem(payload: CreateAdminProblemPayload): Promise<Problem>;
  updateProblem(id: string, payload: UpdateAdminProblemPayload): Promise<Problem>;
  deleteProblem(id: string): Promise<void>;
  getProblemById(id: string): Promise<Problem>;
  getProblemTests(problem_id: string): Promise<ProblemTest[]>;
  updateProblemTests(payload: UpsertProblemTestInput): Promise<ProblemTest>;
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

export class ProblemAdminService implements IProblemAdminService {
  private readonly problemAdminRepository: IProblemAdminRepository;
  private readonly problemTestRepository: IProblemTestRepository;

  constructor(cradle: ICradle) {
    this.problemAdminRepository = cradle.problemAdminRepository;
    this.problemTestRepository = cradle.problemTestRepository;
  }

  async getAllPaginated(page: number, limit: number, search?: string): Promise<{ data: Problem[], total: number }> {
    return this.problemAdminRepository.getAllPaginated(page, limit, search);
  }

  async createProblem(payload: CreateAdminProblemPayload): Promise<Problem> {
    return this.problemAdminRepository.createProblem(payload);
  }

  async updateProblem(id: string, payload: UpdateAdminProblemPayload): Promise<Problem> {
    const updated = await this.problemAdminRepository.updateProblem(id, payload);
    if (!updated) {
      throw AppError.from(ERRORS.PROBLEM.NOT_FOUND);
    }
    return updated;
  }

  async deleteProblem(id: string): Promise<void> {
    await this.problemAdminRepository.deleteProblem(id);
  }

  async getProblemById(id: string): Promise<Problem> {
    const problem = await this.problemAdminRepository.getProblemById(id);
    if (!problem) {
      throw AppError.from(ERRORS.PROBLEM.NOT_FOUND);
    }
    return problem;
  }

  async getProblemTests(problem_id: string): Promise<ProblemTest[]> {
    return this.problemTestRepository.findAllByProblem(problem_id);
  }

  async updateProblemTests(payload: UpsertProblemTestInput): Promise<ProblemTest> {
    return this.problemTestRepository.upsertTests(payload);
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
    return this.problemAdminRepository.getStats();
  }
}
