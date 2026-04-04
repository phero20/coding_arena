import { BaseController } from "./base.controller";
import type { IProblemService } from "../services/problem.service";
import { AppError } from "../utils/app-error";
import { ApiResponse } from "../utils/api-response";
import type { Context } from "hono";
import type { AppEnv, ValidatedContext } from "../types/hono.types";
import type { CreateProblemInput } from "../validators/problem.validator";

export class ProblemController extends BaseController {
  constructor(private readonly problemService: IProblemService) {
    super();
  }

  async createProblem(c: Context<AppEnv, any, ValidatedContext<CreateProblemInput>>) {
    const body = this.getBody(c);
    const problem = await this.problemService.upsertProblem(body);
    return this.created(c, problem);
  }

  async getProblemBySlug(c: Context) {
    const slug = c.req.param("slug")!;
    const problem = await this.problemService.getProblemBySlug(slug);

    if (!problem) {
      throw AppError.notFound("Problem not found");
    }

    return this.ok(c, problem);
  }

  async getProblemById(c: Context) {
    const id = c.req.param("problem_id")!;
    const problem = await this.problemService.getProblemById(id);

    if (!problem) {
      throw AppError.notFound("Problem not found");
    }

    return this.ok(c, problem);
  }

  async getProblemsByTopic(c: Context) {
    const topic = c.req.param("topic")!;
    const limitParam = c.req.query("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    if (limit !== undefined && !Number.isFinite(limit)) {
      throw AppError.badRequest("limit must be a valid number");
    }

    const problems = await this.problemService.searchByTopic(topic, limit);
    return this.ok(c, problems);
  }

  async getProblems(c: Context) {
    const page = Number(c.req.query("page") || "1");
    const limit = Number(c.req.query("limit") || "20");

    const result = await this.problemService.getAllProblems(page, limit);
    return c.json(ApiResponse.paginated(result.problems, {
      totalItems: result.total,
      itemCount: result.problems.length,
      perPage: limit,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
    }).toJSON());
  }
}
