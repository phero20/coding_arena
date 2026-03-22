import type { Context } from 'hono'
import type { AiProblemService } from '../services/ai-problem.service'
import type { ProblemService } from '../services/problem.service'
import type { ProblemTestService } from '../services/problem-test.service'
import type { ImportedProblemPayload } from '../types/problem-import.types'
import { ApiResponse } from '../utils/api-response'
import { AppError } from '../utils/app-error'

export class AiProblemController {
  constructor(
    private readonly aiProblemService: AiProblemService,
    private readonly problemService: ProblemService,
    private readonly problemTestService: ProblemTestService,
  ) {}

  /**
   * Imports a raw external problem (e.g. LeetCode-style), rewrites it via AI
   * for copyright safety, generates test cases, and persists both the problem
   * and its tests.
   *
   * This endpoint is intended for admin/internal tooling only.
   */
  async import(c: Context) {
    const body = (await c.req.json().catch(() => null)) as
      | ImportedProblemPayload
      | null

    if (!body) {
      throw AppError.badRequest('Invalid JSON body')
    }

    if (!body.title || !body.problem_id || !body.problem_slug || !body.description) {
      throw AppError.badRequest(
        'Missing required fields: title, problem_id, problem_slug, description',
      )
    }

    const aiResult = await this.aiProblemService.rewriteAndGenerate(body)

    const savedProblem = await this.problemService.upsertProblem({
      title: aiResult.problem.title,
      problem_id: aiResult.problem.problem_id,
      frontend_id: aiResult.problem.frontend_id,
      difficulty: aiResult.problem.difficulty,
      problem_slug: aiResult.problem.problem_slug,
      topics: aiResult.problem.topics,
      description: aiResult.problem.description,
      examples: aiResult.problem.examples,
      constraints: aiResult.problem.constraints,
      follow_ups: aiResult.problem.follow_ups,
      hints: aiResult.problem.hints,
      code_snippets: aiResult.problem.code_snippets,
      solutions: aiResult.problem.solutions,
    })

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
      'Problem imported and rewritten via AI successfully.',
    )

    return c.json(response.toJSON(), 201)
  }
}

