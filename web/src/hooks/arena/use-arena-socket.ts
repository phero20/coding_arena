import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArenaSocketManager } from "@/services/arena-socket";
import { ArenaWSMessage } from "@/services/arena.service";
import { useEditorStore } from "@/store/use-editor-store";
import { useArenaStore } from "@/store/useArenaStore";

/**
 * Hook to manage the Go WebSocket lifecycle for a specific room.
 * Stabilized to prevent infinite reload loops.
 */
export function useArenaSocket(roomId: string | undefined) {
  const router = useRouter();
  const { getToken, userId, isLoaded } = useAuth();
  const { user } = useUser();
  const socketManagerRef = useRef<ArenaSocketManager | null>(null);

  useEffect(() => {
    // Return early if not all required information is available
    if (!roomId || !userId || !isLoaded || !user) return;

    let isMounted = true;
    const safeRoomId = roomId;

    async function init() {
      try {
        // Fetch token inside the effect instead of making it a dependency
        const token = await getToken();
        if (!token || !isMounted) return;

        // Cleanup any existing connection before starting a new one
        if (socketManagerRef.current) {
          socketManagerRef.current.disconnect();
        }

        const manager = new ArenaSocketManager(
          safeRoomId,
          userId!,
          token,
          user!.username || user!.firstName || "Anonymous",
          user!.imageUrl,
        );

        manager.connect();
        socketManagerRef.current = manager;
      } catch (err) {
        console.error("[Arena Hook] Connection failed:", err);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (socketManagerRef.current) {
        socketManagerRef.current.disconnect();
        socketManagerRef.current = null;
      }
    };
    // Removed getToken and router from dependencies to prevent excessive re-syncing
  }, [roomId, userId, isLoaded, user]);

  const sendMessage = useCallback(
    (type: ArenaWSMessage["type"], payload: any = {}) => {
      if (socketManagerRef.current) {
        socketManagerRef.current.send(type, payload);
      }
    },
    [],
  );

  const sendProgress = useCallback(
    (testsPassed: number, totalTests: number) => {
      sendMessage("PROGRESS_UPDATE", { testsPassed, totalTests });
    },
    [sendMessage],
  );

  const leaveRoom = useCallback(() => {
    sendMessage("LEAVE_ROOM");
    if (socketManagerRef.current) {
      socketManagerRef.current.disconnect();
      socketManagerRef.current = null;
    }

    // Explicitly reset specific arena states when leaving
    const matchId = useArenaStore.getState().matchId;
    if (matchId) {
      useEditorStore.getState().clearSession(`arena:${matchId}`);
    }

    useArenaStore.getState().reset();

    // Redirect to arena dashboard
    router.push("/arena");
  }, [sendMessage, router]);

  return {
    sendMessage,
    sendProgress,
    leaveRoom,
  };
}
