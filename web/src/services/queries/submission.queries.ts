import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Submission } from "@/types/submission";

/**
 * Fetch active submission status and results by ID.
 */
<<<<<<< HEAD
export async function getSubmissionStatus(submissionId: string): Promise<Submission> {
=======
export async function getSubmissionStatus(
  submissionId: string,
): Promise<Submission> {
>>>>>>> prod-deploy
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
<<<<<<< HEAD
export async function getUserSubmissions(problemId: string): Promise<Submission[]> {
=======
export async function getUserSubmissions(
  problemId: string,
): Promise<Submission[]> {
>>>>>>> prod-deploy
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

/**
 * Fetch the chronological history of recent submissions across all problems.
 */
export async function getRecentSubmissions(
  limit: number = 10,
  offset: number = 0,
  username?: string,
): Promise<{
  submissions: Submission[];
  pagination: { total: number; limit: number; offset: number };
}> {
  const response = await apiClient.get<
    ApiResponse<{
      submissions: Submission[];
      pagination: { total: number; limit: number; offset: number };
    }>
  >("/submissions/recent", { params: { limit, offset, username } });

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || "Failed to fetch recent submissions",
    );
  }

  return response.data.data;
}
