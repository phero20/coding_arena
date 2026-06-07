"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { startMatch, createRoom, updateRoomProblem } from "@/services/mutations/arena.mutations";
import { useArenaStore } from "@/store/useArenaStore";

/**
 * Mutation for starting a match (Host only).
 */
export function useStartMatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => startMatch(roomId),
    onSuccess: (data, roomId) => {
      // Invalidate the room query to ensure state consistency
      queryClient.invalidateQueries({ queryKey: ["arena-room", roomId] });

      // We update store immediately for the host experience
      useArenaStore.getState().setMatchId(data.matchId);
      useArenaStore.getState().updateRoom({ status: "PLAYING" });
    },
    onError: (error: any) => {
      const message = "Failed to start the Arena match.";
      toast.error(message);
    }
  });
}

/**
 * Mutation for creating a new Arena Room lobby.
 */
export function useCreateArenaRoomMutation() {
  return useMutation({
    mutationFn: createRoom,
  });
}

/**
 * Mutation for changing the active problem in an Arena lobby.
 */
export function useUpdateArenaProblemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, details }: { roomId: string, details: any }) => 
      updateRoomProblem(roomId, details),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["arena-room", roomId] });
    }
  });
}
