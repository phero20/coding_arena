import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ArenaRoom,
  ArenaPlayer,
  ArenaWSMessage,
  ArenaPlayerResult,
} from "@/services/arena.service";

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
  syncWebSocketState: (message: any) => void;

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

      syncWebSocketState: (message) => {
        const { type, payload } = message;
        console.log(`[Arena Sync] ${type}`, payload);

        switch (type) {
          case "PLAYER_JOINED":
            if (payload?.room) {
              set({ room: payload.room });
            } else if (payload?.player && get().room) {
              const player = payload.player;
              set((state) => ({
                room: state.room
                  ? {
                      ...state.room,
                      players: {
                        ...state.room.players,
                        [player.userId]: player,
                      },
                    }
                  : null,
              }));
            }
            break;

          case "PLAYER_LEFT":
            if (payload?.room) {
              set({ room: payload.room });
            } else if (payload?.userId && get().room) {
              get().removePlayer(payload.userId);
            }
            break;

          case "PLAYER_READY":
          case "PROBLEM_CHANGED":
            if (payload?.room) {
              set({ room: payload.room });
            }
            break;

          case "MATCH_START":
          case "MATCH_STARTED":
            const matchId = payload?.matchId || (message as any).matchId;
            set((state) => ({
              room: state.room
                ? { ...state.room, status: "PLAYING" as any }
                : payload?.room || null,
              matchId: matchId || state.matchId,
            }));
            break;

          case "PROGRESS_UPDATE":
            if (payload?.room) {
              set({ room: payload.room });
            } else if (payload?.userId && get().room) {
              const { userId, testsPassed, totalTests, score } = payload;
              get().updatePlayer(userId, { testsPassed, totalTests, score });
            }
            break;

          case "MATCH_SUBMITTED":
            if (payload?.room) {
              set({ room: payload.room });
            }
            break;

          case "LEADERBOARD_UPDATE":
            if (payload?.room) {
              set({ room: payload.room });
            }
            if (payload?.leaderboard) {
              set({ leaderboard: payload.leaderboard });
            }
            break;

          case "PLAYER_REMOVED":
            if (payload?.userId) {
              const removedUserId = payload.userId;
              get().removePlayer(removedUserId);
            }
            break;

          case "MATCH_ENDED":
          case "MATCH_OVER":
            const finalMatchId = payload?.matchId || get().matchId;
            const rankings = payload?.finalRankings;

            if (finalMatchId) {
              set({ matchEnded: true });
              if (rankings) {
                set({ finalRankings: rankings });
              }

              if (get().room) {
                set((state) => ({
                  room: state.room
                    ? { ...state.room, status: "FINISHED" as any }
                    : null,
                }));
              }
            }
            break;

          case "HOST_TRANSFERRED":
            if (payload?.newHostId) {
              set({ hostTransferred: true, newHostId: payload.newHostId });
            }
            break;

          case "ERROR":
            const errorMsg =
              typeof payload === "string"
                ? payload
                : payload?.message || "Arena Error";

            if (errorMsg.toLowerCase().includes("terminated")) {
              set({ room: null });
            }
            break;
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
        matchId: state.matchId,
        matchEnded: state.matchEnded,
        finalRankings: state.finalRankings,
        matchHostId: state.matchHostId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
