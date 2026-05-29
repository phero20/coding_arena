import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Contest } from "@/types/contest";

/**
 * Fetch upcoming contests from the hybrid Redis/PostgreSQL aggregator.
 * @param limit Number of contests to fetch
 */
export async function getUpcomingContests(limit: number = 50): Promise<Contest[]> {
  const response = await apiClient.get<ApiResponse<Contest[]>>(
    "/contests",
    {
      params: { limit },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch contests");
  }

  return response.data.data;
}

/**
 * Fetch raw external contests from CLIST (Proxy/Debug).
 */
export async function getExternalContests(limit: number = 20, offset: number = 0): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    "/contests/external",
    {
      params: { limit, offset },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch external contests");
  }

  return response.data.data;
}
