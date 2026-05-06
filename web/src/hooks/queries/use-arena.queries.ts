"use client";

import { useQuery } from "@tanstack/react-query";
import { getRoom, getMatchStatus } from "@/services/queries/arena.queries";

/**
 * Hook to fetch and cache Arena Room metadata (server-state).
 */
export function useArenaRoomQuery(roomId: string) {
  return useQuery({
    queryKey: ["arena-room", roomId],
    queryFn: () => getRoom(roomId),
    enabled: !!roomId,
    staleTime: 5000, // Metadata is fairly stable
  });
}

/**
 * Hook to fetch permanent match results from MongoDB.
 */
export function useMatchResultsQuery(matchId: string | null) {
  return useQuery({
    queryKey: ["match-results", matchId],
    queryFn: () => getMatchStatus(matchId!),
    enabled: !!matchId,
    staleTime: Infinity, // Results once generated are permanent
  });
}
