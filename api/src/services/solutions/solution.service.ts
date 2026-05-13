import { type ISolutionRepository, type SolutionWithAuthor } from "../../repositories/solutions/solution.repository";
import { type IProblemRepository } from "../../repositories/problems/problem.repository";
import { type IUserRepository } from "../../repositories/user/user.repository";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import { type CreateSolutionInput } from "../../validators/solution.validator";
import type { Solution, SolutionVote } from "../../db/schema";

export interface ISolutionService {
  createSolution(problemId: string, userId: string, input: CreateSolutionInput): Promise<Solution>;
  getSolutionsForProblem(problemId: string): Promise<SolutionWithAuthor[]>;
  voteForSolution(solutionId: string, userId: string, voteType: number): Promise<void>;
  getSolutionById(id: string): Promise<SolutionWithAuthor>;
  updateSolution(solutionId: string, userId: string, input: Partial<CreateSolutionInput>): Promise<Solution>;
  deleteSolution(solutionId: string, userId: string): Promise<void>;
  getSolutionsByUser(userId: string, limit?: number, offset?: number): Promise<{ items: SolutionWithAuthor[]; total: number; limit: number; offset: number }>;
}

export class SolutionService implements ISolutionService {
  private readonly solutionRepository: ISolutionRepository;
  private readonly problemRepository: IProblemRepository;
  private readonly userRepository: IUserRepository;

  constructor({ solutionRepository, problemRepository, userRepository }: ICradle) {
    this.solutionRepository = solutionRepository;
    this.problemRepository = problemRepository;
    this.userRepository = userRepository;
  }

  // Helper to check if string is UUID
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  async createSolution(problemId: string, userId: string, input: CreateSolutionInput): Promise<Solution> {
    // Create the solution in PostgreSQL directly using metadata from frontend
    // This achieves zero lookups to MongoDB during creation.
    return await this.solutionRepository.create({
      ...input,
      problemId,
      userId,
    });
  }

  async getSolutionsForProblem(problemId: string): Promise<SolutionWithAuthor[]> {
    return await this.solutionRepository.findByProblemId(problemId);
  }

  async getSolutionById(id: string): Promise<SolutionWithAuthor> {
    const solution = await this.solutionRepository.findById(id);
    if (!solution) {
      throw AppError.notFound(`Solution with ID ${id} not found`);
    }
    return solution;
  }

  async voteForSolution(solutionId: string, userId: string, voteType: number): Promise<void> {
    // 1. Verify solution exists
    const solution = await this.solutionRepository.findById(solutionId);
    if (!solution) {
      throw AppError.notFound(`Solution with ID ${solutionId} not found`);
    }

    // 2. Check if the user is trying to apply the same vote they already have
    const existingVote = await this.solutionRepository.getUserVote(userId, solutionId);
    
    if (existingVote && existingVote.voteType === voteType) {
      // Toggle off: user clicked the same button twice
      await this.solutionRepository.deleteVote(userId, solutionId);
    } else {
      // Create new or switch vote type
      await this.solutionRepository.upsertVote({
        userId,
        solutionId,
        voteType,
      });
    }

    // 3. Update cached counts on the solution
    await this.solutionRepository.updateVoteCounts(solutionId);
  }

  async updateSolution(solutionId: string, userId: string, input: Partial<CreateSolutionInput>): Promise<Solution> {
    const solution = await this.solutionRepository.findById(solutionId);
    if (!solution) {
      throw AppError.notFound(`Solution with ID ${solutionId} not found`);
    }

    if (solution.userId !== userId) {
      throw AppError.forbidden("You are not authorized to update this solution");
    }

    return await this.solutionRepository.update(solutionId, input);
  }

  async deleteSolution(solutionId: string, userId: string): Promise<void> {
    const solution = await this.solutionRepository.findById(solutionId);
    if (!solution) {
      throw AppError.notFound(`Solution with ID ${solutionId} not found`);
    }

    if (solution.userId !== userId) {
      throw AppError.forbidden("You are not authorized to delete this solution");
    }

    await this.solutionRepository.delete(solutionId);
  }

  async getSolutionsByUser(identifier: string, limit: number = 10, offset: number = 0): Promise<{ items: SolutionWithAuthor[]; total: number; limit: number; offset: number }> {
    let targetUserId = identifier;

    // 1. Resolve internal userId if clerkId is provided
    if (!this.isUUID(identifier)) {
      const user = await this.userRepository.findByClerkId(identifier);
      if (!user) {
        throw AppError.notFound(`User with Clerk ID ${identifier} not found`);
      }
      targetUserId = user.id;
    }

    // 2. Fetch solutions and total count in parallel
    const [items, total] = await Promise.all([
      this.solutionRepository.findByUserId(targetUserId, limit, offset),
      this.solutionRepository.countByUserId(targetUserId)
    ]);

    return { items, total, limit, offset };
  }
}
