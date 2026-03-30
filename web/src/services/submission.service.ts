import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

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
  problem_id: string;
  language_id: string;
  source_code: string;
}

export interface Submission {
  id: string;
  problem_id: string;
  user_id: string;
  language_id: string;
  source_code: string;
  status: ExecutionVerdict;
  time?: number;
  memory?: number;
  details?: any;
  createdAt: string;
  updatedAt: string;
}

class SubmissionService {
  async runSubmission(
    payload: RunSubmissionPayload,
  ): Promise<RunSubmissionResponse> {
    const response = await apiClient.post<ApiResponse<RunSubmissionResponse>>(
      "/submissions/run",
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to run submission on public tests",
      );
    }

    return response.data.data;
  }

  async submitCode(
    payload: RunSubmissionPayload,
  ): Promise<RunSubmissionResponse> {
    const response = await apiClient.post<ApiResponse<RunSubmissionResponse>>(
      "/submissions/submit",
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to submit code for evaluation",
      );
    }

    return response.data.data;
  }

  async getUserSubmissions(problemId: string): Promise<Submission[]> {
    const response = await apiClient.get<ApiResponse<Submission[]>>(
      `/submissions/problem/${problemId}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to fetch submission history",
      );
    }

    return response.data.data;
  }
}

export const submissionService = new SubmissionService();

