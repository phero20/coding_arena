import { generateExecutionPackage } from "@slavecode/driver/index";
import {
  parseDriverResult,
  type RawJudge0Result,
  type TestCaseResult as DriverTestCaseResult,
} from "@slavecode/driver/core/result-parser";
import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type { IProblemRepository } from "../../repositories/problems/problem.repository";
import type { IProblemTestRepository } from "../../repositories/problems/problem-test.repository";
import type { Judge0SubmissionResult } from "./judge0.service";
import { createLogger } from "../../libs/utils/logger";
import type { ExecutionTestResult } from "../../libs/utils/verdict.util";
import { AppError } from "../../utils/app-error";
// import { getLanguageName } from "../../libs/utils/languages";
import type { AiVerdictAuditService } from "./ai-verdict-audit.service";
import {
  type DriverJudgeInput,
  type DriverJudgeResult,
} from "./driver-judge.types";
import { evaluateSuspicion } from "./suspicion/suspicion-evaluator";

import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("driver-judge-execution-service");
import {
  getLanguageName,
  normalizeLanguageId,
} from "../../libs/utils/languages";

const SUPPORTED_LANGUAGE_IDS = new Set([
  "62",
  // "71",
  // "54",
  // "50",
  // "63",
  // "74",
  // "51",
  // "73",
  // "60",
]);

export class DriverJudgeExecutionService {
  private readonly judge0Service: ICradle["judge0Service"];
  private readonly problemRepository: IProblemRepository;
  private readonly problemTestRepository: IProblemTestRepository;
  private readonly aiVerdictAuditService: AiVerdictAuditService;

  constructor({
    judge0Service,
    problemRepository,
    problemTestRepository,
    aiVerdictAuditService,
  }: ICradle) {
    this.judge0Service = judge0Service;
    this.problemRepository = problemRepository;
    this.problemTestRepository = problemTestRepository;
    this.aiVerdictAuditService = aiVerdictAuditService;
  }

  supportsLanguage(languageId: string): boolean {
    return SUPPORTED_LANGUAGE_IDS.has(normalizeLanguageId(languageId));
  }

  async evaluate(input: DriverJudgeInput): Promise<DriverJudgeResult> {
    const normalizedLanguageId = normalizeLanguageId(input.languageId);
    const [problem, publicTests, hiddenTests] = await Promise.all([
      this.problemRepository.findByProblemId(input.problemId),
      this.problemTestRepository.findByProblemAndType(
        input.problemId,
        "public",
      ),
      this.problemTestRepository.findByProblemAndType(
        input.problemId,
        "hidden",
      ),
    ]);

    if (!problem) {
      throw AppError.notFound(`Problem not found: ${input.problemId}`);
    }

    const selectedCases = [
      ...(publicTests?.cases ?? []),
      ...(input.includeHidden ? (hiddenTests?.cases ?? []) : []),
    ];

    if (selectedCases.length === 0) {
      throw AppError.badRequest("No tests configured for this problem");
    }

    if (problem.problem_type === "function") {
      if (!problem.function_signature) {
        throw AppError.badRequest(
          "Function signature missing for function-type problem",
        );
      }
    } else if (problem.problem_type === "class") {
      if (!problem.class_signature) {
        throw AppError.badRequest(
          "Class signature missing for class-type problem",
        );
      }
    } else {
      throw AppError.badRequest(
        `Driver execution currently supports function and class problems only. Found: ${problem.problem_type}`,
      );
    }

    const signature =
      problem.problem_type === "class"
        ? problem.class_signature!
        : {
            ...problem.function_signature!,
            param_order:
              problem.function_signature!.param_order ??
              problem.function_signature!.params.map((p) => p.name),
          };

    const testCases = selectedCases.map((testCase) => ({
      input: testCase.input,
      expected_output: testCase.expected_output,
      is_sample: testCase.is_sample,
    }));

    const executionPackage = await generateExecutionPackage({
      language: this.resolveLanguageKey(normalizedLanguageId),
      userCode: input.sourceCode,
      signature: signature as any,
      testCases,
    });

    const payload: any = {
      source_code: executionPackage.sourceCode,
      language_id: executionPackage.languageId,
      stdin: executionPackage.stdin,
    };
    if (String(executionPackage.languageId) === "74") {
      payload.compiler_options = "--target ESNext --lib ESNext,DOM";
    }
    const judgeRaw = await this.executeAndPoll(payload, input.traceId);

    const parsed = parseDriverResult(judgeRaw as any, selectedCases.length);

    const tests = parsed.tests.map((driverTest, index) =>
      this.mapDriverCaseToExecutionResult(
        driverTest,
        selectedCases[index],
        judgeRaw,
      ),
    );

    const driverOverallStatus = this.mapDriverVerdictToSubmissionStatus(
      parsed.verdict,
    );
    const suspicion = evaluateSuspicion({
      problem,
      selectedCases,
      parsedWarnings: parsed.parsingWarnings ?? [],
      tests,
      judgeRaw,
      driverOverallStatus,
    });
    logger.info(
      {
        traceId: input.traceId,
        problemId: input.problemId,
        judge0Status: judgeRaw.status,
        driverOverallStatus,
        suspicionScore: suspicion.score,
        suspicionReasons: suspicion.reasons,
      },
      "Primary verdict generated from Judge0 + driver parser",
    );

    let aiAudit: DriverJudgeResult["aiAudit"];
    if (suspicion.needAiAudit) {
      logger.info(
        {
          traceId: input.traceId,
          problemId: input.problemId,
          suspicionScore: suspicion.score,
          suspicionReasons: suspicion.reasons,
        },
        "AI audit triggered for suspicious Judge0 verdict",
      );
      const aiResult = await this.aiVerdictAuditService.audit({
        problemId: input.problemId,
        languageId: normalizedLanguageId,
        languageName: getLanguageName(normalizedLanguageId),
        sourceCode: input.sourceCode,
        tests,
        driverOverallStatus,
        driverVerdict: parsed.verdict,
        parserWarnings: parsed.parsingWarnings,
        suspicionReasons: suspicion.reasons,
        judge0Status: judgeRaw.status,
      });
      const shouldUseAuditVerdict =
        aiResult.confidence >= 0.75 &&
        (suspicion.reasons.includes("invalid_expected_output_semantics") ||
          aiResult.overallStatus === "ACCEPTED");
      aiAudit = {
        overallStatus: aiResult.overallStatus,
        disagreedWithDriver: aiResult.overallStatus !== driverOverallStatus,
      };
      if (
        shouldUseAuditVerdict &&
        aiResult.overallStatus !== driverOverallStatus
      ) {
        logger.warn(
          {
            traceId: input.traceId,
            problemId: input.problemId,
            driverOverallStatus,
            aiOverallStatus: aiResult.overallStatus,
            confidence: aiResult.confidence,
            reasons: suspicion.reasons,
          },
          "Applying AI audit override for suspicious verdict",
        );
        return {
          overallStatus: aiResult.overallStatus,
          tests: aiResult.tests,
          parserWarnings: parsed.parsingWarnings,
          driverVerdict: parsed.verdict,
          suspicion: {
            score: suspicion.score,
            reasons: suspicion.reasons,
            aiAuditTriggered: true,
          },
          aiAudit,
        };
      }
      logger.warn(
        {
          traceId: input.traceId,
          problemId: input.problemId,
          score: suspicion.score,
          reasons: suspicion.reasons,
          driverOverallStatus,
          aiOverallStatus: aiResult.overallStatus,
          confidence: aiResult.confidence,
          aiSummary: aiResult.summary,
        },
        "Suspicious verdict detected, AI audit executed",
      );
    } else {
      logger.info(
        {
          traceId: input.traceId,
          problemId: input.problemId,
          finalSource: "judge0_driver",
          finalStatus: driverOverallStatus,
        },
        "Final verdict source: Judge0 only (AI audit not needed)",
      );
    }

    if (judgeRaw.compile_output) {
      logger.info(
        { traceId: input.traceId, compileOutput: judgeRaw.compile_output },
        "Judge0 compilation error detected",
      );
    }

    return {
      overallStatus: driverOverallStatus,
      tests,
      parserWarnings: parsed.parsingWarnings,
      compileOutput: judgeRaw.compile_output ?? undefined,
      stderr: judgeRaw.stderr ?? undefined,
      driverVerdict: parsed.verdict,
      suspicion: {
        score: suspicion.score,
        reasons: suspicion.reasons,
        aiAuditTriggered: suspicion.needAiAudit,
      },
      ...(aiAudit ? { aiAudit } : {}),
    };
  }

  private async executeAndPoll(
    payload: {
      source_code: string;
      language_id: number;
      compiler_options?: string;
      stdin: string;
    },
    traceId?: string,
  ): Promise<Judge0SubmissionResult> {
    const created = await this.judge0Service.createBatchSubmissions([payload]);
    const token = created[0]?.token;

    if (!token) {
      throw new Error("Judge0 did not return a submission token");
    }

    const maxPollAttempts = 20;
    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      const [result] = await this.judge0Service.getBatchResults([token]);
      if (!result) {
        throw new Error("Judge0 did not return a submission result");
      }

      if (result.status.id !== 1 && result.status.id !== 2) {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    logger.error({ traceId, token }, "Judge0 polling timed out");
    throw new Error(
      "Judge0 execution timed out while polling submission result",
    );
  }

  private mapDriverCaseToExecutionResult(
    driverTest: DriverTestCaseResult,
    originalCase: { input: unknown; expected_output: unknown },
    judgeRaw: Judge0SubmissionResult,
  ): ExecutionTestResult {
    return {
      index: driverTest.index,
      input: JSON.stringify(originalCase.input),
      expected_output: JSON.stringify(originalCase.expected_output),
      stdout: driverTest.actual,
      stderr: driverTest.errorMessage ?? judgeRaw.stderr ?? null,
      compile_output: judgeRaw.compile_output ?? null,
      message: driverTest.errorPhase ?? null,
      status: this.mapDriverVerdictToExecutionVerdict(driverTest.status),
      rawStatus: judgeRaw.status,
      time: String(driverTest.executionTimeMs),
      memory: judgeRaw.memory ?? undefined,
    };
  }

  private mapDriverVerdictToExecutionVerdict(
    verdict: DriverTestCaseResult["status"],
  ): ExecutionTestResult["status"] {
    switch (verdict) {
      case "ACCEPTED":
        return "ACCEPTED";
      case "WRONG_ANSWER":
        return "WRONG_ANSWER";
      case "RUNTIME_ERROR":
        return "RUNTIME_ERROR";
      case "COMPILE_ERROR":
        return "COMPILATION_ERROR";
      case "TIME_LIMIT_EXCEEDED":
        return "TLE";
      case "MEMORY_LIMIT_EXCEEDED":
      case "SYSTEM_ERROR":
      default:
        return "SYSTEM_ERROR";
    }
  }

  private mapDriverVerdictToSubmissionStatus(
    verdict: string,
  ): SubmissionStatus {
    switch (verdict) {
      case "ACCEPTED":
        return "ACCEPTED";
      case "WRONG_ANSWER":
        return "WRONG_ANSWER";
      case "RUNTIME_ERROR":
        return "RUNTIME_ERROR";
      case "COMPILE_ERROR":
        return "COMPILATION_ERROR";
      case "TIME_LIMIT_EXCEEDED":
        return "TLE";
      case "MEMORY_LIMIT_EXCEEDED":
      case "SYSTEM_ERROR":
      default:
        return "SYSTEM_ERROR";
    }
  }
  private resolveLanguageKey(languageId: string): string {
    if (languageId === "71") return "python";
    if (languageId === "54") return "cpp";
    if (languageId === "50") return "c";
    if (languageId === "63") return "javascript";
    if (languageId === "74") return "typescript";
    if (languageId === "51") return "csharp";
    if (languageId === "73") return "rust";
    if (languageId === "60") return "go";
    return "java";
  }
}
