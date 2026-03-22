import type { Context } from 'hono'
import type { SubmissionService } from '../services/submission.service'
import type { ExecutionService } from '../services/execution.service'
import { ApiResponse } from '../utils/api-response'
import { AppError } from '../utils/app-error'

export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly executionService: ExecutionService,
  ) {}

  /**
   * Temporary skeleton for the "run" endpoint.
   *
   * This will eventually:
   * - validate input
   * - fetch public/sample tests for the problem
   * - delegate to an execution service that talks to Judge0
   * - return per-test results synchronously
   */
  async run(c: Context) {
    const body = await c.req.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Invalid JSON body')
    }

    const { problem_id, language_id, source_code } = body

    if (!problem_id || !language_id || !source_code) {
      throw AppError.badRequest(
        'Missing required fields: problem_id, language_id, source_code',
      )
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    const result = await this.executionService.runSamples({
      problemId: problem_id,
      userId,
      languageId: language_id,
      sourceCode: source_code,
    })

    const response = ApiResponse.success(result)

    return c.json(response.toJSON(), 201)
  }

  /**
   * Temporary skeleton for the "submit" endpoint.
   *
   * This will eventually:
   * - create a submission record with PENDING status
   * - enqueue a background job for full test execution
   * - return the submission id immediately
   */
  async submit(c: Context) {
    const body = await c.req.json().catch(() => null)

    if (!body) {
      throw AppError.badRequest('Invalid JSON body')
    }

    const { problem_id, language_id, source_code } = body

    if (!problem_id || !language_id || !source_code) {
      throw AppError.badRequest(
        'Missing required fields: problem_id, language_id, source_code',
      )
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    const submission = await this.submissionService.createSubmission({
      problem_id,
      user_id: userId,
      language_id,
      source_code,
      status: 'RUNNING',
    })

    // Trigger full evaluation (synchronous for now as requested)
    const result = await this.executionService.runFullSubmission({
      problemId: problem_id,
      userId,
      languageId: language_id,
      sourceCode: source_code,
    })

    await this.submissionService.updateSubmissionStatus({
      id: (submission as any).id,
      status: result.overallStatus,
      details: {
        tests: result.tests,
      },
    })

    const response = ApiResponse.success({
      submissionId: (submission as any).id,
      overallStatus: result.overallStatus,
      tests: result.tests,
    })

    return c.json(response.toJSON(), 201)
  }

  async getUserSubmissions(c: Context) {
    const problemId = c.req.param('problemId')

    if (!problemId) {
      throw AppError.badRequest('Missing problemId parameter')
    }

    const auth = c.get('auth')
    const userId = auth?.user?.id

    if (!userId) {
      throw AppError.unauthorized('User not authenticated')
    }

    const submissions = await this.submissionService.getUserSubmissions(
      userId,
      problemId,
    )

    const response = ApiResponse.success(submissions)
    return c.json(response.toJSON())
  }
}

