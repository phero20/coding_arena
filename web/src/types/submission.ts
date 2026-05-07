export type ExecutionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TLE"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "SYSTEM_ERROR";

export interface ExecutionStatus {
  id: number;
  description: string;
}

export interface ExecutionTestResult {
  index: number;
  input: string;
  expected_output: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: ExecutionVerdict;
  rawStatus: ExecutionStatus;
  time: string | null;
  memory?: number | null;
}

export interface RunSubmissionResponse {
  submissionId?: string;
  overallStatus: ExecutionVerdict;
  tests: ExecutionTestResult[];
  compileOutput?: string;
  stderr?: string;
  driverVerdict?: string;
  parserWarnings?: string[];
  suspicion?: { score: number; reasons: string[]; aiAuditTriggered: boolean };
  aiAudit?: { overallStatus: ExecutionVerdict; disagreedWithDriver: boolean };
}

export interface RunSubmissionPayload {
  problemId: string;
  languageId: string;
  sourceCode: string;
  arenaMatchId?: string | null;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle?: string;
  userId: string;
  languageId: string;
  sourceCode: string;
  status: ExecutionVerdict | "PENDING";
  time?: number;
  memory?: number;
  details?: {
    tests?: ExecutionTestResult[];
    compileOutput?: string;
    stderr?: string;
    evaluatedAt?: string;
    evaluationDuration?: number;
    driverVerdict?: string;
    parserWarnings?: string[];
    suspicion?: { score: number; reasons: string[]; aiAuditTriggered: boolean };
    aiAudit?: { overallStatus: ExecutionVerdict; disagreedWithDriver: boolean };
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubmitCodeResponse {
  submissionId: string;
  status: "PENDING" | "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "TLE" | "SYSTEM_ERROR";
  message?: string;
}
