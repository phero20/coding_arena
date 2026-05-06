import type { SubmissionStatus } from "../../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../../libs/utils/verdict.util";
import type { GeminiJsonResponse } from "../../ai/gemini-llm.service";

export type AuditVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TLE"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "SYSTEM_ERROR";

export interface AuditCaseVerdict {
  index: number;
  verdict: AuditVerdict;
  rationale: string;
}

export interface AuditOutput {
  overall_status: AuditVerdict;
  confidence: number;
  summary: string;
  tests: AuditCaseVerdict[];
}

export interface AiVerdictAuditInput {
  problemId: string;
  languageId: string;
  languageName: string;
  sourceCode: string;
  tests: ExecutionTestResult[];
  driverOverallStatus: SubmissionStatus;
  driverVerdict: string;
  parserWarnings?: string[];
  suspicionReasons: string[];
  judge0Status: { id: number; description: string };
}

export interface AiVerdictAuditResult {
  overallStatus: SubmissionStatus;
  confidence: number;
  summary: string;
  tests: ExecutionTestResult[];
  rawLlmResponse: GeminiJsonResponse<AuditOutput>["raw"];
}
