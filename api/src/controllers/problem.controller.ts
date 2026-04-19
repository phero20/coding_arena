import { BaseController } from "./base.controller";
import type { IProblemService } from "../services/problem.service";
import { AppError } from "../utils/app-error";
import { ERRORS } from "../constants/errors";
import { ApiResponse } from "../utils/api-response";
import type { ControllerRequest } from "../types/hono.types";
import type { CreateProblemInput } from "../validators/problem.validator";
import { createLogger } from "../libs/logger";

import type { ProblemValidatorService } from "../services/problem-validator.service";

const logger = createLogger("problem-controller");

/**
 * ProblemController manages problem metadata, search, and pagination.
 */
export class ProblemController extends BaseController {
  constructor(
    private readonly problemService: IProblemService,
    private readonly problemValidatorService: ProblemValidatorService,
  ) {
    super();
  }

  async createProblem(req: ControllerRequest<CreateProblemInput>) {
    return await this.problemService.upsertProblem(req.body);
  }

  async getProblemBySlug(req: ControllerRequest<never, { slug: string }>) {
    const { slug } = req.params;
    
    // 1. Logic Offloading: Validate slug existence
    return await this.problemValidatorService.validateProblemBySlug(slug);
  }

  async getProblemById(req: ControllerRequest<never, { problem_id: string }>) {
    const { problem_id } = req.params;
    
    // 1. Logic Offloading: Validate internal ID existence
    return await this.problemValidatorService.validateProblemExists(problem_id);
  }

  async getProblemsByTopic(req: ControllerRequest<never, { topic: string }, { limit?: number }>) {
    const { topic } = req.params;
    const { limit } = req.query;

    return await this.problemService.searchByTopic(topic, limit);
  }

  async getProblems(req: ControllerRequest<never, any, { page?: number, limit?: number }>) {
    const { page = 1, limit = 20 } = req.query;

    const result = await this.problemService.getAllProblems(page, limit);
    
    // Return a pre-formatted paginated response
    return ApiResponse.paginated(result.problems, {
      totalItems: result.total,
      itemCount: result.problems.length,
      perPage: limit,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
    });
  }
}
