"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useArenaStore } from "@/store/useArenaStore";
import { useArenaSocket } from "@/hooks/arena/use-arena-socket";
import { useArenaRoomQuery, useStartMatchMutation } from "@/hooks/api/use-arena-api";

export function useArenaRoom(roomId: string) {
  // 1. Reactive Store Data (Zustand)
  const { room: storeRoom, isConnected, setRoom, resetStore } = useArenaStore(
    useShallow((state) => ({
      room: state.room,
      isConnected: state.isConnected,
      setRoom: state.setRoom,
      resetStore: state.reset,
    })),
  );

  // 2. Stateless Mount Guard
  // Critical for production stability: if we enter a NEW room and the store 
  // still has data from an OLD room, we MUST wipe it before proceeding.
  useEffect(() => {
    if (storeRoom && storeRoom.roomId !== roomId) {
      resetStore();
    }
  }, [roomId, storeRoom?.roomId, resetStore]);

  // 3. Synchronous ID Match Guard (Production-Grade Safety)
  // We ensure that the data we return ALWAYS belongs to the current roomId.
  // This prevents the "First Render Leak" where stale data remains in the store.
  const validatedStoreRoom = storeRoom?.roomId === roomId ? storeRoom : null;

  // 4. Server State (TanStack Query)
  // Handles initial fetch and caching.
  const { 
    data: roomMetadata, 
    isLoading, 
    error: queryError 
  } = useArenaRoomQuery(roomId);

  // [RESILIENCE] Synchronize initial metadata to store with matching ID verification
  useEffect(() => {
    if (!roomMetadata) return;

    // 1. Unidirectional Hydration: Query -> Store (Initial or mismatch)
    // We only force-sync if the store is empty or the Room ID transitioned.
    // This prevents stale API refetches from overwriting real-time WebSocket joins.
    const isNewRoom = !validatedStoreRoom || validatedStoreRoom.roomId !== roomId;
    
    if (isNewRoom) {
      console.log(`[Arena Hydration] Initializing store from API: ${roomId}`);
      setRoom(roomMetadata);
    }

    // 2. [CRITICAL] Immediate Match Identity Pulse
    // Ensures that even if the room was already in the store (e.g. from previous partial state),
    // the match identity is forcibly synced. This kills "Practice Mode" fallbacks.
    const mId = roomMetadata.matchId || (roomMetadata as any).match_id;
    const currentMId = useArenaStore.getState().matchId;
    
    if (mId && mId !== currentMId) {
       console.log(`[Arena Hydration] Synchronizing Match Identity: ${mId}`);
       useArenaStore.getState().setMatchId(mId);
    }
  }, [roomMetadata, roomId, validatedStoreRoom, setRoom]);

  // 5. Match Actions (TanStack Mutation)
  const startMatchMutation = useStartMatchMutation();

  // 6. Socket Lifecycle
  const socketHandlers = useArenaSocket(roomId);

  return {
    // [INDUSTRY STANDARD] UI ONLY reads from Store to prevent flickering
    room: validatedStoreRoom, 
    isLoading: isLoading && !validatedStoreRoom, 
    error: (queryError as any)?.message || null,
    isStartingMatch: startMatchMutation.isPending,
    startMatch: () => startMatchMutation.mutate(roomId),
    ...socketHandlers,
  };
}
