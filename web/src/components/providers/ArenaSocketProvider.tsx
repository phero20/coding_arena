"use client";

import React, { createContext, useContext } from "react";
import { useArenaSocketConnection } from "@/hooks/arena/use-arena-socket-connection";
import { ArenaWSMessage } from "@/types/arena";

interface ArenaSocketContextType {
  isConnected: boolean;
  activeRoomId: string | null;
  connect: (roomId: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (type: ArenaWSMessage["type"], payload?: any) => void;
}

const ArenaSocketContext = createContext<ArenaSocketContextType | null>(null);

export function ArenaSocketProvider({ children }: { children: React.ReactNode }) {
  const socketState = useArenaSocketConnection();

  return (
    <ArenaSocketContext.Provider value={socketState}>
      {children}
    </ArenaSocketContext.Provider>
  );
}

export const useArenaSocketContext = () => {
  const context = useContext(ArenaSocketContext);
  if (!context) {
    throw new Error("useArenaSocketContext must be used within an ArenaSocketProvider");
  }
  return context;
};
