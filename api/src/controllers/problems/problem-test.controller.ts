import type { Context } from "hono";
import type {
  AppEnv,
  ValidatedContext,
} from "../../types/infrastructure/hono.types";
import type { UpsertTestsInput } from "../../validators/problems/problem-test.validator";
import type { IProblemTestService } from "../../services/problems/problem-test.service";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";

import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";

export class ProblemTestController extends BaseController {
  private readonly problemTestService: IProblemTestService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.problemTestService = cradle.problemTestService;
  }

  async upsertTests(
    c: Context<AppEnv, any, ValidatedContext<UpsertTestsInput>>,
  ) {
    const problem_id = c.req.param("problem_id")!;
    const body = c.req.valid("json");

    const { type, cases } = body;

    const problemTest = await this.problemTestService.upsertTests({
      problem_id,
      type,
      cases,
    });

    const response = ApiResponse.success(problemTest);
    return c.json(response.toJSON(), 201);
  }

  async getTestsForProblem(c: Context) {
    const problem_id = c.req.param("problem_id")!;
    const tests = await this.problemTestService.getTestsForProblem(problem_id);
    const response = ApiResponse.success(tests);
    return c.json(response.toJSON());
  }

  async getTestsForProblemAndType(c: Context) {
    const problem_id = c.req.param("problem_id")!;
    const type = c.req.param("type")!;

    const tests = await this.problemTestService.getTestsForProblemAndType(
      problem_id,
      type as any,
    );

    if (!tests) {
      throw AppError.notFound("Tests not found for given problem and type");
    }

    const response = ApiResponse.success(tests);
    return c.json(response.toJSON());
  }
}
