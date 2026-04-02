import { ProblemTestRepository } from "../../repositories/problem-test.repository";
import { AiJudgeCache } from "../../cache/ai-judge.cache";
import { TestResult, SubmissionEvaluationResult } from "../../types/queue.types";
import { getLanguageName } from "../../libs/languages";
import { createLogger } from "../../libs/logger";

const logger = createLogger("submission-evaluator");

export class SubmissionEvaluator {
  constructor(
    private problemTestRepository: ProblemTestRepository,
    private aiJudgeCache: AiJudgeCache,
  ) {}

  async evaluate(data: {
    problemId: string;
    languageId: string;
    sourceCode: string;
    submissionId: string;
  }): Promise<SubmissionEvaluationResult> {
    const { problemId, languageId, sourceCode, submissionId } = data;

    // 1. Fetch problem details and test cases (both public AND private)
    const problemTests = await this.problemTestRepository.findAllByProblem(
      problemId,
    );

    if (!problemTests || problemTests.length === 0) {
      throw new Error(`No test cases found for problem ${problemId}`);
    }

    // Combine public + private test cases for evaluation
    const allTestCases: any[] = [];
    let testIndex = 0;

    // Add public test cases first
    const publicTestsData = problemTests.find(
      (pt: any) => pt.type === "public",
    );
    if (publicTestsData?.cases) {
      publicTestsData.cases.forEach((testCase: any) => {
        allTestCases.push({
          index: testIndex++,
          input: testCase.input,
          expected_output: testCase.expected_output,
        });
      });
    }

    // Add private test cases
    const privateTestsData = problemTests.find(
      (pt: any) => pt.type === "hidden",
    );
    if (privateTestsData?.cases) {
      privateTestsData.cases.forEach((testCase: any) => {
        allTestCases.push({
          index: testIndex++,
          input: testCase.input,
          expected_output: testCase.expected_output,
        });
      });
    }

    if (allTestCases.length === 0) {
      throw new Error("No test cases available for evaluation");
    }

    logger.debug(
      {
        submissionId,
        publicTests: publicTestsData?.cases?.length || 0,
        hiddenTests: privateTestsData?.cases?.length || 0,
        totalTests: allTestCases.length,
      },
      "Test cases loaded (public + hidden)",
    );

    // 2. Call AiCodeJudgeService with caching
    const evaluationResult = await this.aiJudgeCache.runSamples({
      problemId: problemId,
      languageId: languageId,
      languageName: getLanguageName(languageId),
      sourceCode: sourceCode,
      tests: allTestCases,
    });

    // 3. Parse results
    let finalStatus = evaluationResult.overallStatus;
    if (finalStatus === "PENDING") {
      finalStatus = "SYSTEM_ERROR";
    }

    const testResults: TestResult[] = evaluationResult.tests.map((t: any) => ({
      index: t.index,
      input: t.input,
      expected_output: t.expected_output,
      stdout: t.stdout ?? null,
      stderr: t.stderr ?? null,
      compile_output: t.compile_output ?? null,
      message: t.message ?? null,
      status: t.status as any,
      rawStatus: {
        id: 0,
        description: "AI Evaluation",
      },
      time: t.time ? String(t.time) : null,
      memory: t.memory,
    }));

    return {
      status: finalStatus as any,
      tests: testResults,
      executionTime: 0, // Will be calculated by processor
      cached: evaluationResult.cached,
    };
  }
}
