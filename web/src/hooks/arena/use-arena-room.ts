"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useArenaStore } from "@/store/useArenaStore";
import { useArenaSocket } from "@/hooks/arena/use-arena-socket";
import { useArenaRoomQuery, useStartMatchMutation } from "@/hooks/api/use-arena-api";

export function useArenaRoom(roomId: string) {
  // 1. Reactive Store Data (Zustand)
  // Store handles real-time WS updates.
  const { room: storeRoom, isConnected, setRoom } = useArenaStore(
    useShallow((state) => ({
      room: state.room,
      isConnected: state.isConnected,
      setRoom: state.setRoom,
    })),
  );

  // 2. Server State (TanStack Query)
  // Handles initial fetch and caching.
  const { 
    data: roomMetadata, 
    isLoading, 
    error: queryError 
  } = useArenaRoomQuery(roomId);

  // Sync initial metadata to store IF store is empty or for a different room
  useEffect(() => {
    if (roomMetadata && (!storeRoom || storeRoom.roomId !== roomId)) {
      setRoom(roomMetadata);
    }
  }, [roomMetadata, roomId, storeRoom, setRoom]);

  // 3. Match Actions (TanStack Mutation)
  const startMatchMutation = useStartMatchMutation();

  // 4. Socket Lifecycle
  const socketHandlers = useArenaSocket(roomId);

  return {
    room: storeRoom || roomMetadata || null,
    isConnected,
    isLoading: isLoading && !storeRoom, // Only loading if we have no store data
    error: (queryError as any)?.message || null,
    isStartingMatch: startMatchMutation.isPending,
    startMatch: () => startMatchMutation.mutate(roomId),
    ...socketHandlers,
  };
}
