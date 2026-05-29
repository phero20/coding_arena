"use client";

import { useQuery } from "@tanstack/react-query";
import { getUpcomingContests } from "@/services/queries/contest.queries";

/**
 * Hook to fetch upcoming contests from the aggregated source.
 * Includes automatic refetching every 5 minutes to keep counts/status fresh.
 * @param limit Max number of contests to retrieve
 */
export function useUpcomingContestsQuery(limit: number = 200) {
  return useQuery({
    queryKey: ["contests", "upcoming", limit],
    queryFn: () => getUpcomingContests(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}
