import type { IProblemTestService } from "../problems/problem-test.service";
import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../libs/utils/verdict.util";
import type { IAiJudgeService } from "../judge/ai-code-judge.service";
import type { DriverJudgeExecutionService } from "../judge/driver-judge-execution.service";
import { getLanguageName } from "../../libs/utils/languages";

export interface RunSamplesInput {
  problemId: string;
  userId: string;
  languageId: string;
  sourceCode: string;
}

export interface RunSamplesResult {
  submissionId?: string;
  overallStatus: SubmissionStatus;
  tests: ExecutionTestResult[];
}

import { type ICradle } from "../../libs/awilix-container";

export class ExecutionService {
  private readonly problemTestService: IProblemTestService;
  private readonly aiCodeJudgeService: IAiJudgeService;
  private readonly driverJudgeExecutionService: DriverJudgeExecutionService;

  constructor({
    problemTestService,
    aiCodeJudgeService,
    driverJudgeExecutionService,
  }: ICradle) {
    this.problemTestService = problemTestService;
    this.aiCodeJudgeService = aiCodeJudgeService;
    this.driverJudgeExecutionService = driverJudgeExecutionService;
  }

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
      "public",
    );

    if (!testsDoc || testsDoc.cases.length === 0) {
      throw new Error("No public tests configured for this problem");
    }

    const result = this.driverJudgeExecutionService.supportsLanguage(input.languageId)
      ? await this.driverJudgeExecutionService.evaluate({
          problemId: input.problemId,
          languageId: input.languageId,
          sourceCode: input.sourceCode,
          includeHidden: false,
        })
      : await this.aiCodeJudgeService.runSamples({
          problemId: input.problemId,
          languageId: input.languageId,
          languageName: getLanguageName(input.languageId),
          sourceCode: input.sourceCode,
          tests: testsDoc.cases.map((testCase, index) => ({
            index,
            input: testCase.input,
            expected_output: testCase.expected_output,
          })),
        });
    const tests: ExecutionTestResult[] = result.tests;
    const overallStatus: SubmissionStatus = result.overallStatus;

    return {
      overallStatus,
      tests,
    };
  }

  /**
   * Executes ALL tests (public and hidden) for a problem in a "Submit" mode.
   */
  async runFullSubmission(input: RunSamplesInput): Promise<RunSamplesResult> {
    // 1. Fetch all test case types
    const publicTests = await this.problemTestService.getTestsForProblemAndType(
      input.problemId,
      "public",
    );
    const hiddenTests = await this.problemTestService.getTestsForProblemAndType(
      input.problemId,
      "hidden",
    );

    const allCases: {
      index: number;
      input: unknown;
      expected_output: unknown;
      isPublic: boolean;
    }[] = [];

    // Map public tests
    publicTests?.cases.forEach((c, i) => {
      allCases.push({
        index: i,
        input: c.input,
        expected_output: c.expected_output,
        isPublic: true,
      });
    });

    // Map hidden tests (with index offset)
    const publicCount = allCases.length;
    hiddenTests?.cases.forEach((c, i) => {
      allCases.push({
        index: publicCount + i,
        input: c.input,
        expected_output: c.expected_output,
        isPublic: false,
      });
    });

    if (allCases.length === 0) {
      throw new Error("No tests configured for this problem");
    }

    // 2. We don't reuse the same submission record here because
    // SubmissionController.submit already creates one.
    // Instead, we just perform the evaluation.
    const result = this.driverJudgeExecutionService.supportsLanguage(input.languageId)
      ? await this.driverJudgeExecutionService.evaluate({
          problemId: input.problemId,
          languageId: input.languageId,
          sourceCode: input.sourceCode,
          includeHidden: true,
        })
      : await this.aiCodeJudgeService.runSamples({
          problemId: input.problemId,
          languageId: input.languageId,
          languageName: getLanguageName(input.languageId),
          sourceCode: input.sourceCode,
          tests: allCases.map((c) => ({
            index: c.index,
            input: JSON.stringify(c.input),
            expected_output: JSON.stringify(c.expected_output),
          })),
        });

    const tests: ExecutionTestResult[] = result.tests;
    const overallStatus: SubmissionStatus = result.overallStatus;

    return {
      overallStatus,
      tests,
    };
  }
}
