import { create } from "zustand";

interface LeaderboardState {
  limit: number;
  offset: number;
  searchQuery: string;
  setLimit: (limit: number) => void;
  setOffset: (offset: number) => void;
  setSearchQuery: (query: string) => void;
  resetPagination: () => void;
}

/**
 * Zustand store to manage leaderboard UI state (pagination, searching, filters).
 * Separates UI logic from data fetching logic.
 */
export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  limit: 50,
  offset: 0,
  searchQuery: "",
  setLimit: (limit) => set({ limit }),
  setOffset: (offset) => set({ offset }),
  setSearchQuery: (searchQuery) => set({ searchQuery, offset: 0 }), // Reset offset on search
  resetPagination: () => set({ offset: 0 }),
}));
