import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  RunSubmissionPayload,
  RunSubmissionResponse,
  SubmitCodeResponse,
} from "@/types/submission";

/**
 * Execute code snippets against public test cases only.
 */
export async function runSubmission(
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

/**
 * Submit code for full evaluation (background task).
 */
export async function submitCode(
  payload: RunSubmissionPayload,
): Promise<SubmitCodeResponse> {
  const response = await apiClient.post<ApiResponse<SubmitCodeResponse>>(
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
