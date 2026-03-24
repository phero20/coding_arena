import type { ProblemTestService } from './problem-test.service'
import type { SubmissionService } from './submission.service'
import type { SubmissionStatus } from '../mongo/models/submission.model'
import type { ExecutionTestResult } from '../libs/verdict.util'
import type { AiCodeJudgeService } from './ai-code-judge.service'

export interface RunSamplesInput {
  problemId: string
  userId: string
  languageId: string
  sourceCode: string
}

export interface RunSamplesResult {
  submissionId: string
  overallStatus: SubmissionStatus
  tests: ExecutionTestResult[]
}

export class ExecutionService {
  constructor(
    private readonly problemTestService: ProblemTestService,
    private readonly aiCodeJudgeService: AiCodeJudgeService,
    private readonly submissionService: SubmissionService,
  ) {}

  /**
   * Executes public/sample tests for a problem in a synchronous "Run" mode.
   *
   * This:
   * - creates a submission record
   * - sends all public test cases to Judge0 in a batch
   * - polls for completion
   * - computes per-test verdicts and an overall status
   */
  async runSamples(input: RunSamplesInput): Promise<RunSamplesResult> {
    const testsDoc = await this.problemTestService.getTestsForProblemAndType(
      input.problemId,
      'public',
    )

    if (!testsDoc || testsDoc.cases.length === 0) {
      throw new Error('No public tests configured for this problem')
    }

    const submission = await this.submissionService.createSubmission({
      problem_id: input.problemId,
      user_id: input.userId,
      language_id: input.languageId,
      source_code: input.sourceCode,
      status: 'RUNNING',
    })

    const aiResult = await this.aiCodeJudgeService.runSamples({
      problemId: input.problemId,
      languageId: input.languageId,
      // For now we pass the id as name; frontend can later send a friendly language name if needed.
      languageName: input.languageId,
      sourceCode: input.sourceCode,
      tests: testsDoc.cases.map((testCase, index) => ({
        index,
        input: testCase.input,
        expected_output: testCase.expected_output,
      })),
    })

    const tests: ExecutionTestResult[] = aiResult.tests

    const overallStatus: SubmissionStatus = aiResult.overallStatus

    await this.submissionService.updateSubmissionStatus({
      id: (submission as any).id,
      status: overallStatus,
      // For now, we aggregate max time/memory across tests where available.
      time: undefined,
      memory: undefined,
      details: {
        tests,
      },
    })

    return {
      submissionId: (submission as any).id,
      overallStatus,
      tests,
    }
  }

  /**
   * Executes ALL tests (public and hidden) for a problem in a "Submit" mode.
   */
  async runFullSubmission(input: RunSamplesInput): Promise<RunSamplesResult> {
    // 1. Fetch all test case types
    const publicTests = await this.problemTestService.getTestsForProblemAndType(
      input.problemId,
      'public',
    )
    const hiddenTests = await this.problemTestService.getTestsForProblemAndType(
      input.problemId,
      'hidden',
    )

    const allCases: {
      index: number
      input: string
      expected_output: string
      isPublic: boolean
    }[] = []

    // Map public tests
    publicTests?.cases.forEach((c, i) => {
      allCases.push({
        index: i,
        input: c.input,
        expected_output: c.expected_output,
        isPublic: true,
      })
    })

    // Map hidden tests (with index offset)
    const publicCount = allCases.length
    hiddenTests?.cases.forEach((c, i) => {
      allCases.push({
        index: publicCount + i,
        input: c.input,
        expected_output: c.expected_output,
        isPublic: false,
      })
    })

    if (allCases.length === 0) {
      throw new Error('No tests configured for this problem')
    }

    // 2. We don't reuse the same submission record here because
    // SubmissionController.submit already creates one.
    // Instead, we just perform the evaluation.
    const aiResult = await this.aiCodeJudgeService.runSamples({
      problemId: input.problemId,
      languageId: input.languageId,
      languageName: input.languageId,
      sourceCode: input.sourceCode,
      tests: allCases.map((c) => ({
        index: c.index,
        input: c.input,
        expected_output: c.expected_output,
      })),
    })

    const tests: ExecutionTestResult[] = aiResult.tests
    const overallStatus: SubmissionStatus = aiResult.overallStatus

    return {
      submissionId: '', // Will be handled by controller
      overallStatus,
      tests,
    }
  }
}

