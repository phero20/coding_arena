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
  memory?: number;
}

export interface RunSubmissionResponse {
  submissionId: string;
  overallStatus: string;
  tests: ExecutionTestResult[];
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
  userId: string;
  languageId: string;
  sourceCode: string;
  status: ExecutionVerdict | "PENDING";
  time?: number;
  memory?: number;
  details?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitCodeResponse {
  submissionId: string;
  status: "PENDING" | "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "TLE" | "SYSTEM_ERROR";
  message?: string;
}
