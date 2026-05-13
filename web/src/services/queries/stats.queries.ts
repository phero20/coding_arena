import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { UserProfileData, UserStats, LeaderboardEntry, LeaderboardResponse } from "@/types/stats";

/**
 * Fetch full profile analytics for a user by their username.
 */
export async function getProfileStats(username: string): Promise<UserProfileData> {
  const response = await apiClient.get<ApiResponse<UserProfileData>>(
    `/stats/profile/${username}`,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "User stats not found");
  }

  return response.data.data;
}

/**
 * Fetch the global leaderboard.
 */
export async function getLeaderboard(
  limit = 50,
  offset = 0,
): Promise<LeaderboardResponse> {
  const response = await apiClient.get<ApiResponse<LeaderboardResponse>>(
    "/stats/leaderboard",
    {
      params: { limit, offset },
    },
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch leaderboard");
  }

  return response.data.data;
}

/**
 * Search the leaderboard for users.
 */
export async function searchLeaderboard(
  query: string,
  limit = 20,
): Promise<{ entries: LeaderboardEntry[] }> {
  const response = await apiClient.get<ApiResponse<{ entries: LeaderboardEntry[] }>>(
    "/stats/leaderboard/search",
    {
      params: { q: query, limit },
    },
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Search failed");
  }

  return response.data.data;
}
