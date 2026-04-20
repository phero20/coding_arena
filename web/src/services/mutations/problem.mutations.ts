import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Problem } from "@/types/api";

/**
 * Create or update a problem definition.
 */
export async function createOrUpdateProblem(payload: Problem): Promise<Problem> {
  const response = await apiClient.post<ApiResponse<Problem>>(
    "/problems",
    payload,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create/update problem");
  }

  return response.data.data;
}
