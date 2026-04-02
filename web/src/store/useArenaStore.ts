import { create } from "zustand";
import { ArenaRoom, ArenaPlayer } from "@/services/arena.service";

interface ArenaState {
  room: ArenaRoom | null;
  isConnected: boolean;
  socket: WebSocket | null;
  error: string | null;

  // Actions
  setRoom: (room: ArenaRoom | null) => void;
  updateRoom: (updates: Partial<ArenaRoom>) => void;
  updatePlayer: (userId: string, updates: Partial<ArenaPlayer>) => void;
  setIsConnected: (connected: boolean) => void;
  setSocket: (socket: WebSocket | null) => void;
  setError: (error: string | null) => void;
  
  // Utility
  reset: () => void;
}

/**
 * Global Store for Arena match state.
 * Bridges React Query (initial load) and WebSockets (real-time updates).
 */
export const useArenaStore = create<ArenaState>((set) => ({
  room: null,
  isConnected: false,
  socket: null,
  error: null,

  setRoom: (room) => set({ room }),

  updateRoom: (updates) => 
    set((state) => ({
      room: state.room ? { ...state.room, ...updates } : null,
    })),

  updatePlayer: (userId, updates) =>
    set((state) => {
      if (!state.room || !state.room.players[userId]) return state;
      
      const updatedPlayers = {
        ...state.room.players,
        [userId]: { ...state.room.players[userId], ...updates },
      };

      return {
        room: { ...state.room, players: updatedPlayers },
      };
    }),

  setIsConnected: (isConnected) => set({ isConnected }),

  setSocket: (socket) => set({ socket }),
  
  setError: (error) => set({ error }),

  reset: () => set({ room: null, isConnected: false, socket: null, error: null }),
}));
