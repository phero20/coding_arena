"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfileStats, getLeaderboard } from "@/services/queries/stats.queries";

/**
 * Hook to fetch full profile analytics (stats + activity) for a user.
 * 
 * @param username The slug/username of the user to fetch.
 */
export function useProfileStatsQuery(username: string) {
  return useQuery({
    queryKey: ["stats", "profile", username],
    queryFn: () => getProfileStats(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // Stats are relatively stable, 5min cache
  });
}

/**
 * Hook to fetch the global rankings leaderboard.
 * 
 * @param limit Number of entries to fetch (default 50).
 * @param offset Pagination offset (default 0).
 */
export function useLeaderboardQuery(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["stats", "leaderboard", limit, offset],
    queryFn: () => getLeaderboard(limit, offset),
    staleTime: 1000 * 60 * 10, // Leaderboards can stay stale for 10min
  });
}
