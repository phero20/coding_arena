import { create } from "zustand";
import { ArenaRoom, ArenaPlayer } from "@/services/arena.service";

interface ArenaState {
  room: ArenaRoom | null;
  leaderboard: any[];
  matchEnded: boolean;
  finalRankings: any[];
  userRemoved: boolean;
  removedReason: string | null;
  hostTransferred: boolean;
  newHostId: string | null;
  isConnected: boolean;
  socket: WebSocket | null;
  error: string | null;

  // Actions
  setRoom: (room: ArenaRoom | null) => void;
  setLeaderboard: (leaderboard: any[]) => void;
  setMatchEnded: (ended: boolean, rankings: any[]) => void;
  setUserRemoved: (removed: boolean, reason: string | null) => void;
  setHostTransferred: (transferred: boolean, newHostId: string | null) => void;
  removePlayer: (userId: string) => void;
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
  leaderboard: [],
  matchEnded: false,
  finalRankings: [],
  userRemoved: false,
  removedReason: null,
  hostTransferred: false,
  newHostId: null,
  isConnected: false,
  socket: null,
  error: null,

  setRoom: (room) => set({ room }),

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setMatchEnded: (matchEnded, finalRankings) => set({ matchEnded, finalRankings }),

  setUserRemoved: (userRemoved, removedReason) => set({ userRemoved, removedReason }),

  setHostTransferred: (hostTransferred, newHostId) => set({ hostTransferred, newHostId }),

  removePlayer: (userId) => set((state) => {
    if (!state.room) return state;
    const { [userId]: _, ...remainingPlayers } = state.room.players;
    return {
      room: { ...state.room, players: remainingPlayers }
    };
  }),

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

  reset: () => set({ 
    room: null, 
    leaderboard: [],
    matchEnded: false,
    finalRankings: [],
    userRemoved: false,
    removedReason: null,
    hostTransferred: false,
    newHostId: null,
    isConnected: false, 
    socket: null, 
    error: null 
  }),
}));
