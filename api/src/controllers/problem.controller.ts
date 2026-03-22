import type { Context } from "hono";
import { ProblemService } from "../services/problem.service";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../utils/app-error";

export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  async createProblem(c: Context) {
    const body = await c.req.json().catch(() => null);

    if (!body) {
      throw AppError.badRequest("Invalid JSON body");
    }

    const {
      title,
      problem_id,
      frontend_id,
      difficulty,
      problem_slug,
      topics,
      description,
      examples,
      constraints,
      follow_ups,
      hints,
      code_snippets,
      solutions,
    } = body;

    if (!title || !problem_id || !difficulty || !problem_slug || !description) {
      throw AppError.badRequest("Missing required fields for problem");
    }

    const problem = await this.problemService.upsertProblem({
      title,
      problem_id,
      frontend_id,
      difficulty,
      problem_slug,
      topics,
      description,
      examples,
      constraints,
      follow_ups,
      hints,
      code_snippets,
      solutions,
    });

    const response = ApiResponse.success(problem);
    return c.json(response.toJSON(), 201);
  }

  async getProblemBySlug(c: Context) {
    const slug = c.req.param("slug")!;
    const problem = await this.problemService.getProblemBySlug(slug);

    if (!problem) {
      throw AppError.notFound("Problem not found");
    }

    const response = ApiResponse.success(problem);
    return c.json(response.toJSON());
  }

  async getProblemById(c: Context) {
    const id = c.req.param("problem_id")!;
    const problem = await this.problemService.getProblemById(id);

    if (!problem) {
      throw AppError.notFound("Problem not found");
    }

    const response = ApiResponse.success(problem);
    return c.json(response.toJSON());
  }

  async getProblemsByTopic(c: Context) {
    const topic = c.req.param("topic")!;
    const limitParam = c.req.query("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    const problems = await this.problemService.searchByTopic(topic, limit);
    const response = ApiResponse.success(problems);
    return c.json(response.toJSON());
  }

  async getProblems(c: Context) {
    const page = Number(c.req.query("page") || "1");
    const limit = Number(c.req.query("limit") || "20");

    const result = await this.problemService.getAllProblems(page, limit);
    const response = ApiResponse.paginated(result.problems, {
      totalItems: result.total,
      itemCount: result.problems.length,
      perPage: limit,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page,
    });
    return c.json(response.toJSON());
  }
}
