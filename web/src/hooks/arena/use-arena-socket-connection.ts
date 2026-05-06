import { useRef, useState, useCallback, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArenaSocketManager } from "@/services/arena-socket";
import type { ArenaWSMessage } from "@/types/arena";

export function useArenaSocketConnection() {
  const { getToken, userId, isLoaded } = useAuth();
  const { user } = useUser();
  
  const [isConnected, setIsConnected] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const socketManagerRef = useRef<ArenaSocketManager | null>(null);

  const disconnect = useCallback(() => {
    console.log(`[Arena Provider] Explicit Disconnect requested.`);
    
    // 1. Force manager cleanup immediately
    if (socketManagerRef.current) {
      socketManagerRef.current.disconnect();
      socketManagerRef.current = null;
    }

    // 2. Clear state
    setIsConnected(false);
    setActiveRoomId(null);
  }, []); // No dependencies: stable across renders

  const connect = useCallback(async (roomId: string) => {
    // 1. [IDEMPOTENCY GUARD] Check manager ref directly (Atomic)
    const currentManager = socketManagerRef.current;
    if (currentManager && currentManager.getRoomId() === roomId) {
      console.log(`[Arena Provider] Already connected to room ${roomId}, skipping.`);
      return;
    }

    // 2. Cleanup old connection if switching rooms
    if (socketManagerRef.current) {
      socketManagerRef.current.disconnect();
      socketManagerRef.current = null;
    }

    if (!userId || !user || !isLoaded) {
      console.warn("[Arena Provider] Cannot connect: Auth not ready.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      console.log(`[Arena Provider] Initializing connection for room: ${roomId}`);
      
      const manager = new ArenaSocketManager(
        roomId,
        userId,
        token,
        user.username || user.firstName || "Anonymous",
        user.imageUrl,
      );

      manager.connect();
      socketManagerRef.current = manager;
      setActiveRoomId(roomId);
      setIsConnected(true);
    } catch (err) {
      console.error("[Arena Provider] Connection failed:", err);
      setIsConnected(false);
    }
  }, [userId, user, isLoaded, getToken]);

  const sendMessage = useCallback((type: ArenaWSMessage["type"], payload: any = {}) => {
    if (socketManagerRef.current) {
      socketManagerRef.current.send(type, payload);
    } else {
       console.warn(`[Arena Provider] Cannot send ${type}: No active connection.`);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketManagerRef.current) {
        socketManagerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    activeRoomId,
    connect,
    disconnect,
    sendMessage,
  };
}
