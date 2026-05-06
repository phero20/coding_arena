import type { SubmissionStatus } from "../../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../../libs/utils/verdict.util";
import type { Problem, TestCase } from "../../../types/problems/problem.types";
import type { Judge0SubmissionResult } from "../judge0.service";
import type { SuspicionResult } from "../driver-judge.types";
import { hasInvalidTwoSumExpectedOutput } from "./semantic-checks";

export interface SuspicionInput {
  problem: Problem;
  selectedCases: TestCase[];
  parsedWarnings: string[];
  tests: ExecutionTestResult[];
  judgeRaw: Judge0SubmissionResult;
  driverOverallStatus: SubmissionStatus;
}

export function evaluateSuspicion(input: SuspicionInput): SuspicionResult {
  let score = 0;
  const reasons: string[] = [];
  const comparatorMode = input.problem.judging_policy?.comparator_mode ?? "strict";
  const multiAnswerRisk =
    input.problem.judging_policy?.multi_answer === true ||
    input.problem.problem_slug === "two-sum";

  if (input.parsedWarnings.length > 0) {
    score += 3;
    reasons.push("parser_warnings");
  }

  if (multiAnswerRisk && comparatorMode === "strict") {
    score += 3;
    reasons.push("multi_answer_under_strict_compare");
  }

  if (
    (input.problem.judging_policy?.validation_policy ===
      "two_sum_indices_sum_target" ||
      input.problem.problem_slug === "two-sum") &&
    hasInvalidTwoSumExpectedOutput(input.selectedCases)
  ) {
    score += 4;
    reasons.push("invalid_expected_output_semantics");
  }

  const failedCount = input.tests.filter((t) => t.status !== "ACCEPTED").length;
  if (multiAnswerRisk && failedCount === 1 && input.tests.length > 1) {
    score += 2;
    reasons.push("single_failure_on_multi_answer_problem");
  }

  if (input.judgeRaw.status.id === 3 && input.driverOverallStatus === "SYSTEM_ERROR") {
    score += 1;
    reasons.push("judge0_parsed_mismatch_pattern");
  }

  return {
    score,
    reasons,
    needAiAudit: score >= 4,
  };
}
