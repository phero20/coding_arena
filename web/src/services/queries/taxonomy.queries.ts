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
