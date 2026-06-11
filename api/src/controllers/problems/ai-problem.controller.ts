import type { Context } from "hono";
import type {
  AppEnv,
  ValidatedContext,
} from "../../types/infrastructure/hono.types";
import type { ImportedProblemInput } from "../../validators/problems/ai-problem.validator";
import type { AiProblemService } from "../../services/problems/ai-problem.service";
import type { AiAddSolveService } from "../../services/problems/ai-addsolve.service";
import type { IProblemService } from "../../services/problems/problem.service";
import type { IProblemTestService } from "../../services/problems/problem-test.service";
import type { TestcaseGeneratorService } from "../../services/problems/testcase-generator.service";
import { ApiResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";

import { BaseController } from "../base.controller";
import { type ICradle } from "../../libs/awilix-container";

export class AiProblemController extends BaseController {
  private readonly aiProblemService: AiProblemService;
  private readonly aiAddSolveService: AiAddSolveService;
  private readonly problemService: IProblemService;
  private readonly problemTestService: IProblemTestService;
  private readonly testcaseGeneratorService: TestcaseGeneratorService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.aiProblemService = cradle.aiProblemService;
    this.aiAddSolveService = cradle.aiAddSolveService;
    this.problemService = cradle.problemService;
    this.problemTestService = cradle.problemTestService;
    this.testcaseGeneratorService = cradle.testcaseGeneratorService;
  }

  /**
   * Imports a raw external problem (e.g. LeetCode-style), rewrites it via AI
   * for copyright safety, generates test cases, and persists both the problem
   * and its tests.
   *
   * This endpoint is intended for admin/internal tooling only.
   */
  async import(
    c: Context<AppEnv, any, ValidatedContext<ImportedProblemInput>>,
  ) {
    const body = c.req.valid("json");

    const aiResult = await this.aiProblemService.rewriteAndGenerate(body as any);

    const savedProblem = await this.problemService.upsertProblem(
      aiResult.problem as any,
    );

    const response = ApiResponse.success({
      problem: savedProblem,
    });

    return c.json(response.toJSON(), 201);
  }

  /**
   * Triggers the AI Solution & Signature Generation for a single problem
   * This endpoint receives the problemId from the URL and runs the generation.
   */
  async generateAiSolution(
    c: Context<AppEnv, any, ValidatedContext<never>>,
  ) {
    const { problemId } = c.req.param();

    if (!problemId) {
      throw AppError.badRequest("problemId is required");
    }

    await this.aiAddSolveService.processSingleProblem(problemId);

    return c.json({ success: true }, 200);
  }

  /**
   * Generates 10 testcases (3 public, 7 hidden) for a given problem
   * using strictly Gemini 2.5 Flash and strict canonical type validation.
   */
  async generateTestcases(
    c: Context<AppEnv, any, ValidatedContext<never>>,
  ) {
    const { problemId } = c.req.param();

    if (!problemId) {
      throw AppError.badRequest("problemId is required");
    }

    await this.testcaseGeneratorService.generateTestcases(problemId);

    return c.json({ success: true }, 200);
  }
}
