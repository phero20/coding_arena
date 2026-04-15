"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { arenaService } from "@/services/arena.service";
import { submissionService } from "@/services/submission.service";
import { useArenaStore } from "@/store/useArenaStore";

/**
 * Hook to fetch and cache Arena Room metadata (server-state).
 */
export function useArenaRoomQuery(roomId: string) {
  return useQuery({
    queryKey: ["arena-room", roomId],
    queryFn: () => arenaService.getRoom(roomId),
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
    queryFn: () => arenaService.getMatchStatus(matchId!),
    enabled: !!matchId,
    staleTime: Infinity, // Results are permanent once generated
  });
}

/**
 * Mutation for starting a match (Host only).
 */
export function useStartMatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => arenaService.startMatch(roomId),
    onSuccess: (data, roomId) => {
      // Invalidate the room query to ensure state consistency
      queryClient.invalidateQueries({ queryKey: ["arena-room", roomId] });

      // We don't manually push to matchId here if we rely on WS sync,
      // but for host we might want immediate local feedback.
      useArenaStore.getState().setMatchId(data.matchId);
      useArenaStore.getState().updateRoom({ status: "PLAYING" });
    },
  });
}

/**
 * Unified mutation for code evaluations (Run or Submit).
 */
export function useEvaluateMutation() {
  const { matchId, updateEvaluation } = useArenaStore.getState();

  return useMutation({
    mutationFn: async ({
      problemId,
      languageId,
      code,
      isSubmission = false,
    }: {
      problemId: string;
      languageId: string;
      code: string;
      isSubmission?: boolean;
    }) => {
      if (isSubmission) {
        return submissionService.submitCode({
          problemId,
          languageId,
          sourceCode: code,
          arenaMatchId: matchId || undefined,
        });
      } else {
        return submissionService.runSubmission({
          problemId,
          languageId,
          sourceCode: code,
        });
      }
    },
    onMutate: () => {
      updateEvaluation({
        submissionId: null,
        overallStatus: "PENDING",
        tests: [],
        isLoading: true,
        error: null,
      });
    },
    onSuccess: (data: any) => {
      updateEvaluation({
        submissionId: data.submissionId,
        overallStatus: data.overallStatus || data.status || "PENDING",
        tests: data.tests || [],
        isLoading: (data.overallStatus || data.status) === "PENDING",
        error: null,
      });
    },
    onError: (err: any) => {
      updateEvaluation({
        submissionId: null,
        overallStatus: "ERROR",
        tests: [],
        isLoading: false,
        error: err.message || "Evaluation Failed",
      });
    },
  });
}
