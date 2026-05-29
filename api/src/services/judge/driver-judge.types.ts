import type { SubmissionStatus } from "../../mongo/models/submission.model";
import type { ExecutionTestResult } from "../../libs/utils/verdict.util";

export interface DriverJudgeInput {
  problemId: string;
  languageId: string;
  sourceCode: string;
  includeHidden: boolean;
  traceId?: string;
}

export interface SuspicionResult {
  score: number;
  reasons: string[];
  needAiAudit: boolean;
}

export interface DriverJudgeResult {
  overallStatus: SubmissionStatus;
  tests: ExecutionTestResult[];
  parserWarnings?: string[];
  compileOutput?: string;
  stderr?: string;
  driverVerdict: string;
  suspicion?: {
    score: number;
    reasons: string[];
    aiAuditTriggered: boolean;
  };
  aiAudit?: {
    overallStatus: SubmissionStatus;
    disagreedWithDriver: boolean;
  };
}
