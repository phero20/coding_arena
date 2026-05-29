import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Solution } from "@/types/api";

/**
 * Fetch all solutions for a specific problem.
 */
export async function getSolutionsForProblem(problemId: string): Promise<Solution[]> {
  const response = await apiClient.get<ApiResponse<Solution[]>>(
    `/problems/${problemId}/solutions`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch solutions");
  }

  return response.data.data;
}

/**
 * Fetch all solutions authored by a specific user.
 */
export async function getSolutionsByUser(userId: string, limit: number = 10, offset: number = 0): Promise<{ items: Solution[]; total: number; limit: number; offset: number }> {
  const response = await apiClient.get<ApiResponse<{ items: Solution[]; total: number; limit: number; offset: number }>>(
    `/solutions/user/${userId}`,
    { params: { limit, offset } }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch user solutions");
  }

  return response.data.data;
}
