import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Submission } from "@/types/submission";

/**
 * Fetch active submission status and results by ID.
 */
export async function getSubmissionStatus(submissionId: string): Promise<Submission> {
  const response = await apiClient.get<ApiResponse<Submission>>(
    `/submissions/${submissionId}`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || "Failed to fetch submission status",
    );
  }

  return response.data.data;
}

/**
 * Fetch the submission history for a specific problem.
 */
export async function getUserSubmissions(problemId: string): Promise<Submission[]> {
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
