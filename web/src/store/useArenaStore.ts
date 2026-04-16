import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ArenaRoom,
  ArenaPlayer,
  ArenaWSMessage,
  ArenaPlayerResult,
} from "@/services/arena.service";
import { ArenaEventProcessor } from "@/services/arena-event-processor";

export interface ArenaEvaluation {
  submissionId: string | null;
  overallStatus: string | null;
  tests: any[];
  isLoading: boolean;
  error: string | null;
}

interface ArenaState {
  room: ArenaRoom | null;
  leaderboard: any[];
  matchEnded: boolean;
  finalRankings: ArenaPlayerResult[];
  matchHostId: string | null;
  userRemoved: boolean;
  removedReason: string | null;
  hostTransferred: boolean;
  newHostId: string | null;
  isConnected: boolean;
  socket: WebSocket | null;

  // Evaluation state
  evaluation: ArenaEvaluation | null;
  matchId: string | null;

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
  syncWebSocketState: (message: any, sourceRoomId: string) => void;

  // Evaluation Actions
  setEvaluation: (evaluation: ArenaEvaluation | null) => void;
  updateEvaluation: (updates: Partial<ArenaEvaluation>) => void;
  setMatchId: (matchId: string | null) => void;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Utility
  reset: () => void;
}

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      room: null,
      leaderboard: [],
      matchEnded: false,
      finalRankings: [],
      matchHostId: null,
      userRemoved: false,
      removedReason: null,
      hostTransferred: false,
      newHostId: null,
      isConnected: false,
      socket: null,
      evaluation: null,
      matchId: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setEvaluation: (evaluation) => set({ evaluation }),

      updateEvaluation: (updates) =>
        set((state) => ({
          evaluation: state.evaluation
            ? { ...state.evaluation, ...updates }
            : {
                submissionId: null,
                overallStatus: null,
                tests: [],
                isLoading: false,
                error: null,
                ...updates,
              },
        })),

      syncWebSocketState: (message, sourceRoomId) => {
        const { room: currentRoom, matchId: currentMatchId } = get();

        // 1. Production-Grade Isolation Guard
        if (currentRoom && currentRoom.roomId.toUpperCase() !== sourceRoomId.toUpperCase()) {
          console.warn(
            `[Arena Store] Isolation Breach: Ignoring message from room ${sourceRoomId}. ` +
            `Current Active Room: ${currentRoom.roomId}. Reason: Room mismatch.`
          );
          return;
        }

        const { type, payload } = message;
        console.log(`[Arena Sync] ${type}`, payload);

        // 2. Delegate Business Logic to Processor
        let updates: Partial<ArenaState> = {};

        switch (type) {
          case "PLAYER_JOINED":
            updates = ArenaEventProcessor.processPlayerJoined(
              payload,
              currentRoom,
            );
            break;
          case "PLAYER_LEFT":
            updates = ArenaEventProcessor.processPlayerLeft(
              payload,
              currentRoom,
            );
            break;
          case "PLAYER_READY":
          case "PROBLEM_CHANGED":
          case "MATCH_DURATION_CHANGED":
          case "MATCH_SUBMITTED":
            if (payload?.room) updates = { room: payload.room };
            break;
          case "MATCH_START":
          case "MATCH_STARTED":
            updates = ArenaEventProcessor.processMatchStarted(
              payload,
              currentRoom,
              currentMatchId,
            );
            break;
          case "PROGRESS_UPDATE":
            updates = ArenaEventProcessor.processProgressUpdate(
              payload,
              currentRoom,
            );
            break;
          case "LEADERBOARD_UPDATE":
            if (payload?.room) updates.room = payload.room;
            if (payload?.leaderboard) updates.leaderboard = payload.leaderboard;
            break;
          case "PLAYER_KICKED":
            if (payload?.room) updates = { room: payload.room };
            break;
          case "YOU_ARE_KICKED":
            // 1. Mark user as removed
            get().setUserRemoved(true, typeof payload === "string" ? payload : "You have been removed from the lobby.");
            
            // 2. Kill the socket connection immediately to prevent background sync
            const currentSocket = get().socket;
            if (currentSocket) {
              currentSocket.close(1000, "Kicked by host");
            }

            // 3. Reset the store (except for the removal state info)
            const reason = typeof payload === "string" ? payload : "Removed by host";
            get().reset();
            get().setUserRemoved(true, reason);
            return;
          case "MATCH_ENDED":
          case "MATCH_OVER":
            updates = ArenaEventProcessor.processMatchEnded(
              payload,
              currentRoom,
              currentMatchId,
            );
            break;
          case "HOST_TRANSFERRED":
            if (payload?.newHostId) {
              updates = { hostTransferred: true, newHostId: payload.newHostId };
            }
            break;
          case "ERROR":
            updates = ArenaEventProcessor.processError(payload);
            break;
        }

        // 3. Atomically Apply Updates
        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },

      setRoom: (room) => set({ room }),
      setLeaderboard: (leaderboard) => set({ leaderboard }),
      setMatchEnded: (matchEnded, finalRankings) =>
        set({ matchEnded, finalRankings }),

      setUserRemoved: (userRemoved, removedReason) =>
        set({ userRemoved, removedReason }),

      setHostTransferred: (hostTransferred, newHostId) =>
        set({ hostTransferred, newHostId }),

      removePlayer: (userId) =>
        set((state) => {
          if (!state.room) return state;
          const { [userId]: _, ...remainingPlayers } = state.room.players;
          return {
            room: { ...state.room, players: remainingPlayers },
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
      setMatchId: (matchId) => set({ matchId }),

      reset: () =>
        set({
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
          evaluation: null,
          matchId: null,
        }),
    }),
    {
      name: "arena-match-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // We only persist minimal, harmless metadata
        // matchId and matchEnded are REMOVED to prevent cross-room stale state
        matchHostId: state.matchHostId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
