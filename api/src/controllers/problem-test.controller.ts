import type { Context } from 'hono'
import type { ProblemTestService } from '../services/problem-test.service'
import { ApiResponse } from '../utils/api-response'
import { AppError } from '../utils/app-error'

export class ProblemTestController {
  constructor(private readonly problemTestService: ProblemTestService) {}

  async upsertTests(c: Context) {
    const problem_id = c.req.param('problem_id')!
    const body = await c.req.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Invalid JSON body')
    }

    const { type, cases } = body

    if (!type || !cases || !Array.isArray(cases)) {
      throw AppError.badRequest(
        'Missing required fields: type and cases (array)',
      )
    }

    const problemTest = await this.problemTestService.upsertTests({
      problem_id,
      type,
      cases,
    })

    const response = ApiResponse.success(problemTest)
    return c.json(response.toJSON(), 201)
  }

  async getTestsForProblem(c: Context) {
    const problem_id = c.req.param('problem_id')!
    const tests = await this.problemTestService.getTestsForProblem(problem_id)
    const response = ApiResponse.success(tests)
    return c.json(response.toJSON())
  }

  async getTestsForProblemAndType(c: Context) {
    const problem_id = c.req.param('problem_id')!
    const type = c.req.param('type')!

    const tests =
      await this.problemTestService.getTestsForProblemAndType(
        problem_id,
        type as any,
      )

    if (!tests) {
      throw AppError.notFound('Tests not found for given problem and type')
    }

    const response = ApiResponse.success(tests)
    return c.json(response.toJSON())
  }
}

