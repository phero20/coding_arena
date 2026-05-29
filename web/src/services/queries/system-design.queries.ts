import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { SystemDesignTopic, SystemDesignTopicContent } from "@/types/system-design";

/**
 * Fetch all available system design topics for the sidebar.
 */
export async function getSystemDesignTopics(): Promise<SystemDesignTopic[]> {
  const response = await apiClient.get<ApiResponse<SystemDesignTopic[]>>(
    "/system-design/topics"
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch system design topics");
  }

  return response.data.data;
}

/**
 * Fetch the specific markdown content for a system design topic.
 */
export async function getSystemDesignTopicContent(slug: string): Promise<SystemDesignTopicContent> {
  const response = await apiClient.get<ApiResponse<SystemDesignTopicContent>>(
    `/system-design/topics/${slug}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || `Failed to fetch topic content for ${slug}`);
  }

  return response.data.data;
}
