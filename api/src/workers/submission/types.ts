import { WorkerOptions } from "bullmq";

export interface TestResult {
  index: number;
  input: string;
  expected_output: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: string;
  rawStatus: {
    id: number;
    description: string;
  };
  time: number | null;
  memory: number;
}

export interface SubmissionEvaluationResult {
  status:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR"
    | "TLE"
    | "SYSTEM_ERROR";
  tests: TestResult[];
  executionTime: number;
  cached?: boolean;
}

export interface JobFailureEvent {
  jobId: string;
  attemptsMade: number;
  error: Error;
  isRateLimitError: boolean;
  isNetworkError: boolean;
}
