import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, searchLeaderboard } from "@/services/queries/stats.queries";
import { LeaderboardResponse, LeaderboardEntry } from "@/types/stats";

/**
 * Hook to fetch and manage global leaderboard data.
 * Supports limit and offset for pagination.
 */
export function useLeaderboard(limit = 50, offset = 0) {
  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", { limit, offset }],
    queryFn: () => getLeaderboard(limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to search for users across the entire leaderboard.
 */
export function useLeaderboardSearch(query: string, limit = 20) {
  return useQuery<{ entries: LeaderboardEntry[] }>({
    queryKey: ["leaderboard", "search", query, limit],
    queryFn: () => searchLeaderboard(query, limit),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
