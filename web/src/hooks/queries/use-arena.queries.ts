"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  getRoom, 
  getMatchStatus, 
  getArenaHistory, 
  getMatchDetail 
} from "@/services/queries/arena.queries";

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

/**
 * Hook to fetch detailed match results (including code) from MongoDB.
 */
export function useArenaMatchDetailsQuery(matchId: string | null) {
  return useQuery({
    queryKey: ["match-details-detailed", matchId],
    queryFn: () => getMatchDetail(matchId!),
    enabled: !!matchId,
    staleTime: Infinity, // Historical code never changes
  });
}

/**
 * Hook to fetch the match history for a specific user.
 */
export function useArenaHistoryQuery(userId: string) {
  return useQuery({
    queryKey: ["arena-history", userId],
    queryFn: () => getArenaHistory(userId),
    enabled: !!userId,
    staleTime: 60000, // History is relatively fresh but cached
  });
}
