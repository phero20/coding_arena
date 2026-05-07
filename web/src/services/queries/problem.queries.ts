import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Problem, PaginationMeta } from "@/types/api";

/**
 * Fetch a problem by its slug.
 */
export async function getProblemBySlug(slug: string): Promise<Problem> {
  const response = await apiClient.get<ApiResponse<Problem>>(
    `/problems/${slug}`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Problem not found");
  }

  return response.data.data;
}

/**
 * Fetch a problem by its ID.
 */
export async function getProblemById(problemId: string): Promise<Problem> {
  const response = await apiClient.get<ApiResponse<Problem>>(
    `/problems/id/${problemId}`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Problem not found");
  }

  return response.data.data;
}

/**
 * Fetch problems related to a specific topic.
 */
export async function getProblemsByTopic(topic: string, limit?: number): Promise<Problem[]> {
  const response = await apiClient.get<ApiResponse<Problem[]>>(
    `/problems/topic/${encodeURIComponent(topic)}`,
    {
      params: limit ? { limit } : undefined,
    },
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch problems");
  }

  return response.data.data;
}

/**
 * Fetch a paginated list of problems.
 */
export async function getProblems(
  page = 1,
  limit = 20,
): Promise<{ problems: Problem[]; meta: PaginationMeta }> {
  const response = await apiClient.get<ApiResponse<Problem[]>>("/problems", {
    params: { page, limit },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch problems");
  }

  return {
    problems: response.data.data,
    meta: response.data.meta as PaginationMeta,
  };
}
