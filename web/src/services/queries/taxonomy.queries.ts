import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { CategoryTreeNode, CategoryDetail } from "@/types/taxonomy";

/**
 * Fetch the full hierarchical taxonomy tree.
 */
export async function getTaxonomyTree(): Promise<CategoryTreeNode[]> {
  const response = await apiClient.get<ApiResponse<CategoryTreeNode[]>>(
    "/taxonomy/tree",
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch taxonomy tree");
  }

  return response.data.data;
}

/**
 * Fetch a specific category detail including its problems.
 */
export async function getCategoryDetail(slug: string): Promise<CategoryDetail> {
  const response = await apiClient.get<ApiResponse<CategoryDetail>>(
    `/taxonomy/${slug}`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Category not found");
  }

  return response.data.data;
}

/**
 * Fetch a specific category detail including its problems by ID.
 */
export async function getCategoryDetailById(id: string): Promise<CategoryDetail> {
  const response = await apiClient.get<ApiResponse<CategoryDetail>>(
    `/taxonomy/detail/${id}`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Category not found");
  }

  return response.data.data;
}
/**
 * Fetch the current user's hybrid roadmap progress (counts and solved IDs).
 */
export async function getUserRoadmapProgress(): Promise<{
  counts: Record<string, number>;
  solvedIds: string[];
}> {
  const response = await apiClient.get<
    ApiResponse<{ counts: Record<string, number>; solvedIds: string[] }>
  >("/taxonomy/user/progress");

  if (!response.data.success || !response.data.data) {
    // If not logged in or error, return empty state
    return { counts: {}, solvedIds: [] };
  }

  return response.data.data;
}
