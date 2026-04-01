"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { arenaService } from "@/services/arena.service";
import { useArenaStore } from "@/store/useArenaStore";
import { useArenaSocket } from "@/hooks/use-arena-socket";

export function useArenaRoom(roomId: string) {
  // 1. Store Selection
  const [room, isConnected, globalError, setRoom] = useArenaStore(
    useShallow((state) => [state.room, state.isConnected, state.error, state.setRoom])
  );

  // 2. Data Fetching
  const {
    data: initialRoom,
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ["arena-room", roomId],
    queryFn: () => arenaService.getRoom(roomId),
    enabled: !!roomId,
    staleTime: 0, 
  });

  // Sync initial data to store
  useEffect(() => {
    if (initialRoom) {
      setRoom(initialRoom);
    }
  }, [initialRoom, setRoom]);

  // 3. Socket Lifecycle
  const { sendReady, sendStartMatch, ...socketHandlers } = useArenaSocket(roomId);

  const error = globalError || (fetchError as any)?.message;

  return {
    room,
    isConnected,
    error,
    isLoading,
    refetch,
    setReady: sendReady,
    startMatch: sendStartMatch,
    ...socketHandlers
  };
}
