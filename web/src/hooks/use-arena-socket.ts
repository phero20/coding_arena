"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArenaSocketManager } from "@/services/arena-socket";
import { ArenaWSMessage } from "@/services/arena.service";
import { useEditorStore } from "@/store/match-store/use-editor-store";

/**
 * Hook to manage the Go WebSocket lifecycle for a specific room.
 */
export function useArenaSocket(roomId: string | undefined) {
  const router = useRouter();
  const { getToken, userId, isLoaded } = useAuth();
  const { user } = useUser();
  const socketManagerRef = useRef<ArenaSocketManager | null>(null);

  useEffect(() => {
    if (!roomId || !userId || !isLoaded || !user) return;

    let isMounted = true;

    const initSocket = async () => {
      // 1. Get verified JWT from Clerk
      try {
        const token = await getToken();
        if (!token || !isMounted) return;

        // 2. Clear old manager if exists
        if (socketManagerRef.current) {
          socketManagerRef.current.disconnect();
        }

        // 3. Create fresh manager instance
        const manager = new ArenaSocketManager(
          roomId,
          userId,
          token,
          user.username || user.firstName || "Anonymous",
          user.imageUrl
        );

        manager.connect();
        socketManagerRef.current = manager;
      } catch (err) {
        console.error("[Arena Hook] Failed to initialize socket:", err);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketManagerRef.current) {
        socketManagerRef.current.disconnect();
        socketManagerRef.current = null;
      }
    };
  }, [roomId, userId, isLoaded, user?.username, user?.imageUrl, getToken]);

  const sendMessage = useCallback((type: ArenaWSMessage["type"], payload: any = {}) => {
    if (socketManagerRef.current) {
      socketManagerRef.current.send(type, payload);
    }
  }, []);


  const sendStartMatch = useCallback(() => {
    sendMessage("START_MATCH");
  }, [sendMessage]);

  const sendProgress = useCallback((testsPassed: number, totalTests: number) => {
    sendMessage("PROGRESS_UPDATE", { testsPassed, totalTests });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    sendMessage("LEAVE_ROOM");
    if (socketManagerRef.current) {
      socketManagerRef.current.disconnect();
      socketManagerRef.current = null;
    }
    // Explicitly reset editor state on intentional leave
    useEditorStore.getState().reset();
    // Redirect to arena dashboard
    router.push("/arena");
  }, [sendMessage, router]);

  return {
    sendMessage,
    sendStartMatch,
    sendProgress,
    leaveRoom,
  };
}
