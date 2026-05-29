import { BaseController } from "../base.controller";
import type { ISolutionService } from "../../services/solutions/solution.service";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import type { CreateSolutionInput, VoteSolutionInput } from "../../validators/solution.validator";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";

export class SolutionController extends BaseController {
  private readonly solutionService: ISolutionService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.solutionService = cradle.solutionService;
  }

  /**
   * POST /problems/:id/solutions
   */
  async createSolution(req: ControllerRequest<CreateSolutionInput, { id: string }>) {
    const { id: problemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw AppError.unauthorized();
    }

    return await this.solutionService.createSolution(problemId, userId, req.body);
  }

  /**
   * GET /problems/:id/solutions
   */
  async getSolutionsForProblem(req: ControllerRequest<never, { id: string }>) {
    const { id: problemId } = req.params;
    return await this.solutionService.getSolutionsForProblem(problemId);
  }

  /**
   * POST /solutions/:id/vote
   */
  async voteForSolution(req: ControllerRequest<VoteSolutionInput, { id: string }>) {
    const { id: solutionId } = req.params;
    const { voteType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw AppError.unauthorized();
    }

    await this.solutionService.voteForSolution(solutionId, userId, voteType);
    return { success: true };
  }

  /**
   * PATCH /solutions/:id
   */
  async updateSolution(req: ControllerRequest<Partial<CreateSolutionInput>, { id: string }>) {
    const { id: solutionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw AppError.unauthorized();
    }

    return await this.solutionService.updateSolution(solutionId, userId, req.body);
  }

  /**
   * DELETE /solutions/:id
   */
  async deleteSolution(req: ControllerRequest<never, { id: string }>) {
    const { id: solutionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw AppError.unauthorized();
    }

    await this.solutionService.deleteSolution(solutionId, userId);
    return { success: true };
  }

  /**
   * GET /solutions/user/:userId
   */
  async getSolutionsByUser(req: ControllerRequest<never, { userId: string }>) {
    const { userId } = req.params;
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);
    return await this.solutionService.getSolutionsByUser(userId, limit, offset);
  }
}
