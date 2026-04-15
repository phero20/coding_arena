import { useEffect, useCallback } from "react";
import { useArenaSocketContext } from "@/components/providers/ArenaSocketProvider";

/**
 * Hook to consume the Global Persistent Socket Gateway.
 * Ensures the connection stays alive during navigation while 
 * providing simple helper methods to components.
 */
export function useArenaSocket(roomId: string | undefined) {
  const { 
    connect, 
    disconnect, 
    sendMessage, 
    isConnected, 
    activeRoomId 
  } = useArenaSocketContext();

  useEffect(() => {
    // [IDEMPOTENCY] Connect only if we have a roomId and it's different 
    // from the currently connected one.
    if (roomId) {
      connect(roomId);
    }
    
    // NOTE: We DO NOT disconnect here anymore. 
    // The connection persists across pages until explicitly closed or changed.
  }, [roomId, connect]);

  const sendProgress = useCallback(
    (testsPassed: number, totalTests: number) => {
      sendMessage("PROGRESS_UPDATE", { testsPassed, totalTests });
    },
    [sendMessage],
  );

  const leaveRoom = useCallback(() => {
    sendMessage("LEAVE_ROOM");
    disconnect();
  }, [sendMessage, disconnect]);

  return {
    sendMessage,
    sendProgress,
    leaveRoom,
    isConnected: isConnected && activeRoomId === roomId,
  };
}
