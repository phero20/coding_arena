import type { IProblemTestService } from "../problems/problem-test.service";
<<<<<<< HEAD
import type { SubmissionService } from "./submission.service";
import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../libs/utils/verdict.util";
import type { IAiJudgeService } from "../judge/ai-code-judge.service";
=======
import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../libs/utils/verdict.util";
import type { IAiJudgeService } from "../judge/ai-code-judge.service";
import type { DriverJudgeExecutionService } from "../judge/driver-judge-execution.service";
>>>>>>> prod-deploy
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
<<<<<<< HEAD
=======
  compileOutput?: string;
  stderr?: string;
>>>>>>> prod-deploy
}

import { type ICradle } from "../../libs/awilix-container";

<<<<<<< HEAD
export class ExecutionService {
  private readonly problemTestService: IProblemTestService;
  private readonly aiCodeJudgeService: IAiJudgeService;
  private readonly submissionService: SubmissionService;
=======
export interface IExecutionService {
  runSamples(input: RunSamplesInput): Promise<RunSamplesResult>;
  runFullSubmission(input: RunSamplesInput): Promise<RunSamplesResult>;
}

export class ExecutionService implements IExecutionService {
  private readonly problemTestService: IProblemTestService;
  private readonly aiCodeJudgeService: IAiJudgeService;
  private readonly driverJudgeExecutionService: DriverJudgeExecutionService;
>>>>>>> prod-deploy

  constructor({
    problemTestService,
    aiCodeJudgeService,
<<<<<<< HEAD
    submissionService,
  }: ICradle) {
    this.problemTestService = problemTestService;
    this.aiCodeJudgeService = aiCodeJudgeService;
    this.submissionService = submissionService;
=======
    driverJudgeExecutionService,
  }: ICradle) {
    this.problemTestService = problemTestService;
    this.aiCodeJudgeService = aiCodeJudgeService;
    this.driverJudgeExecutionService = driverJudgeExecutionService;
>>>>>>> prod-deploy
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

<<<<<<< HEAD
    const aiResult = await this.aiCodeJudgeService.runSamples({
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
    const tests: ExecutionTestResult[] = aiResult.tests;
    const overallStatus: SubmissionStatus = aiResult.overallStatus;
=======
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
            input: JSON.stringify(testCase.input),
            expected_output: JSON.stringify(testCase.expected_output),
          })),
        });
    const tests: ExecutionTestResult[] = result.tests;
    const overallStatus: SubmissionStatus = result.overallStatus;
    const compileOutput = "compileOutput" in result ? (result.compileOutput as string) : undefined;
    const stderr = "stderr" in result ? (result.stderr as string) : undefined;
>>>>>>> prod-deploy

    return {
      overallStatus,
      tests,
<<<<<<< HEAD
=======
      compileOutput,
      stderr,
>>>>>>> prod-deploy
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
<<<<<<< HEAD
      input: string;
      expected_output: string;
=======
      input: unknown;
      expected_output: unknown;
>>>>>>> prod-deploy
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
<<<<<<< HEAD
    const aiResult = await this.aiCodeJudgeService.runSamples({
      problemId: input.problemId,
      languageId: input.languageId,
      languageName: getLanguageName(input.languageId),
      sourceCode: input.sourceCode,
      tests: allCases.map((c) => ({
        index: c.index,
        input: c.input,
        expected_output: c.expected_output,
      })),
    });

    const tests: ExecutionTestResult[] = aiResult.tests;
    const overallStatus: SubmissionStatus = aiResult.overallStatus;
=======
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
    const compileOutput = "compileOutput" in result ? (result.compileOutput as string) : undefined;
    const stderr = "stderr" in result ? (result.stderr as string) : undefined;
>>>>>>> prod-deploy

    return {
      overallStatus,
      tests,
<<<<<<< HEAD
=======
      compileOutput,
      stderr,
>>>>>>> prod-deploy
    };
  }
}
