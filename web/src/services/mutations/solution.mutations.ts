import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Solution, CreateSolutionInput, VoteSolutionInput } from "@/types/api";

/**
 * Create a new solution for a problem.
 */
export async function createSolution(
  problemId: string,
  data: CreateSolutionInput
): Promise<Solution> {
  const response = await apiClient.post<ApiResponse<Solution>>(
    `/problems/${problemId}/solutions`,
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create solution");
  }

  return response.data.data;
}

/**
 * Cast a vote on a solution.
 */
export async function voteSolution(
  solutionId: string,
  voteType: 1 | -1
): Promise<boolean> {
  const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
    `/solutions/${solutionId}/vote`,
    { voteType }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to cast vote");
  }

  return true;
}

/**
 * Update an existing solution.
 */
export async function updateSolution(
  solutionId: string,
  data: Partial<CreateSolutionInput>
): Promise<Solution> {
  const response = await apiClient.patch<ApiResponse<Solution>>(
    `/solutions/${solutionId}`,
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to update solution");
  }

  return response.data.data;
}

/**
 * Delete a solution.
 */
export async function deleteSolution(solutionId: string): Promise<boolean> {
  const response = await apiClient.delete<ApiResponse<any>>(
    `/solutions/${solutionId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete solution");
  }

  return true;
}
