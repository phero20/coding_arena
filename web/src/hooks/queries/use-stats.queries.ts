"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProfileStats,
  getLeaderboard,
  searchLeaderboard,
} from "@/services/queries/stats.queries";

// ... (existing hooks)

/**
 * Hook to search for users in the leaderboard.
 *
 * @param query Search string.
 * @param limit Max results (default 20).
 */
export function useLeaderboardSearchQuery(query: string, limit = 20) {
  return useQuery({
    queryKey: ["stats", "leaderboard", "search", query, limit],
    queryFn: () => searchLeaderboard(query, limit),
    enabled: query.length >= 2, // Search after 2 characters
    staleTime: 1000 * 60 * 2, // Search results can stay for 2 mins
  });
}

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
