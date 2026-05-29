import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
<<<<<<< HEAD
import type { UserProfileData, UserStats } from "@/types/stats";
=======
import type { UserProfileData, UserStats, LeaderboardEntry, LeaderboardResponse } from "@/types/stats";
>>>>>>> prod-deploy

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
<<<<<<< HEAD
): Promise<UserStats[]> {
  const response = await apiClient.get<ApiResponse<UserStats[]>>(
=======
): Promise<LeaderboardResponse> {
  const response = await apiClient.get<ApiResponse<LeaderboardResponse>>(
>>>>>>> prod-deploy
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
<<<<<<< HEAD
=======

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
>>>>>>> prod-deploy
