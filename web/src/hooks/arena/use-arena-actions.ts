"use client";

import { useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createRoom, updateRoomProblem } from "@/services/mutations/arena.mutations";
import type { ArenaRoomStatus } from "@/types/arena";
import { useArenaStore } from "@/store/useArenaStore";
import { useEditorStore } from "@/store/use-editor-store";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useArenaSocketContext } from "@/components/providers/ArenaSocketProvider";

/**
 * Handles automatic routing/transitions based on room state.
 * Consolidates all "where to go" logic for match state changes.
 */
export function useArenaTransitions(
  roomId: string,
  status?: ArenaRoomStatus,
  matchEnded?: boolean,
) {
  const router = useRouter();
  const { userRemoved, removedReason, resetStore } = useArenaStore(
    useShallow((state) => ({
      userRemoved: state.userRemoved,
      removedReason: state.removedReason,
      resetStore: state.reset,
    })),
  );

  useEffect(() => {
    // 1. [KICKED] Immediate evacuation
    if (userRemoved) {
      toast.error(removedReason || "You have been removed from the room.");
      resetStore();
      router.push("/arena");
      return;
    }

    // 2. Safety: If we don't have a status or roomId, or if we are clearly in the wrong context, ABORT.
    if (!status || !roomId || roomId === "undefined") return;

    // 3. Execution Function
    const executeTransition = () => {
      if (status === "PLAYING" && !matchEnded) {
        if (!window.location.pathname.includes(`/arena/match/${roomId}`)) {
          console.log(`[Arena Transition] Matching -> ${roomId}`);
          router.push(`/arena/match/${roomId}`);
        }
      } else if (status === "FINISHED" || matchEnded) {
        if (!window.location.pathname.includes(`/results`)) {
          console.log(`[Arena Transition] Concluding -> /arena/match/${roomId}/results`);
          router.push(`/arena/match/${roomId}/results`);
        }
      }
    };

    // 4. Fire immediately when state changes
    executeTransition();

    // 5. Industry-Standard Fix
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        executeTransition();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, roomId, router, matchEnded, userRemoved, removedReason, resetStore]);
}

export function useCreateArena() {
  const router = useRouter();

  const mutation = useMutation({
    mutationKey: ["create-arena"],
    mutationFn: (params?: {
      problemId: string;
      problemSlug: string;
      difficulty: string;
      language?: string;
    }) => createRoom(params),
    onSuccess: (room) => {
      toast.success("Arena Room Created!");
      router.push(`/arena/${room.roomId}`);
    },
    onError: (err) => {
      console.error("Host Arena Error:", err);
      toast.error("Failed to create arena room");
    },
  });

  return {
    hostArena: (params?: {
      problemId: string;
      problemSlug: string;
      difficulty: string;
      language?: string;
    }) => mutation.mutate(params as any),
    isHosting: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

export function useUpdateArenaProblem(roomId: string) {
  const router = useRouter();

  const mutation = useMutation({
    mutationKey: ["update-arena-problem", roomId],
    mutationFn: (params: {
      problemId: string;
      problemSlug: string;
      difficulty: string;
      language?: string;
    }) => updateRoomProblem(roomId, params),
    onSuccess: () => {
      toast.success("Problem updated successfully!");
      router.push(`/arena/${roomId}`);
    },
    onError: (err: any) => {
      console.error("Update Arena Problem Error:", err);
      toast.error(err.message || "Failed to update problem");
    },
  });

  return {
    updateProblem: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useJoinArena() {
  const router = useRouter();

  const joinArena = (roomId: string) => {
    const cleanId = roomId.toUpperCase().trim();
    if (!cleanId) {
      toast.error("Please enter a valid Invite Code");
      return;
    }
    router.push(`/arena/${cleanId}`);
  };

  return {
    joinArena,
  };
}

/**
 * Consolidates all "Exit" logic (Socket, Store, Editor, Routing).
 */
export function useLeaveArena() {
  const router = useRouter();
  const { disconnect } = useArenaSocketContext();
  const { socket, matchId, resetStore, setEvaluation } = useArenaStore(
    useShallow((state: any) => ({
      socket: state.socket,
      matchId: state.matchId,
      resetStore: state.reset,
      setEvaluation: state.setEvaluation,
    })),
  );

  return useCallback(
    (shouldClearSession = false) => {
      // 1. [IMMEDIATE] Protocol level leave
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "LEAVE_ROOM" }));
      }

      // 2. [IMMEDIATE] Tear down global connection
      // Non-destructive to the UI, safe to call before navigation
      disconnect();

      // 3. Navigation (HIGHEST PRIORITY)
      // Transition while the 'room' data is still valid in the store 
      // to avoid triggering skeletons/crashes on the current page.
      router.push("/arena");

      // 4. [DEFERRED] Destructive state cleanup
      setTimeout(() => {
        // Evaluation state reset
        setEvaluation(null);

        // Persistent state cleanup (Optional)
        if (shouldClearSession) {
          if (matchId) {
            useEditorStore.getState().clearSession(`arena:${matchId}`);
          }
          const currentRoom = useArenaStore.getState().room;
          if (currentRoom?.roomId) {
            useEditorStore
              .getState()
              .clearSession(`arena:room:${currentRoom.roomId}`);
          }
        }

        // Final atomic reset (Wipes 'room' object)
        resetStore();
      }, 300); // Give the router enough time to escape the Match screen
    },
    [socket, matchId, resetStore, setEvaluation, router, disconnect],
  );
}
