import type { Context } from 'hono'
import type { AppEnv, ValidatedContext } from '../types/hono.types'
import type { ImportedProblemInput } from '../validators/ai-problem.validator'
import type { AiProblemService } from '../services/ai-problem.service'
import type { IProblemService } from '../services/problem.service'
import type { IProblemTestService } from '../services/problem-test.service'
import { ApiResponse } from '../utils/api-response'
import { AppError } from '../utils/app-error'

export class AiProblemController {
  constructor(
    private readonly aiProblemService: AiProblemService,
    private readonly problemService: IProblemService,
    private readonly problemTestService: IProblemTestService,
  ) {}

  /**
   * Imports a raw external problem (e.g. LeetCode-style), rewrites it via AI
   * for copyright safety, generates test cases, and persists both the problem
   * and its tests.
   *
   * This endpoint is intended for admin/internal tooling only.
   */
  async import(c: Context<AppEnv, any, ValidatedContext<ImportedProblemInput>>) {
    const body = c.req.valid("json");

    const aiResult = await this.aiProblemService.rewriteAndGenerate(body)

    const savedProblem = await this.problemService.upsertProblem(aiResult.problem)

    await this.problemTestService.upsertTests({
      problem_id: savedProblem.problem_id,
      type: 'public',
      cases: aiResult.publicTests,
    })

    await this.problemTestService.upsertTests({
      problem_id: savedProblem.problem_id,
      type: 'hidden',
      cases: aiResult.hiddenTests,
    })

    const response = ApiResponse.success(
      {
        problem: savedProblem,
        testCaseCounts: {
          public: aiResult.publicTests.length,
          hidden: aiResult.hiddenTests.length,
        },
      },
    )

    return c.json(response.toJSON(), 201)
  }
}

