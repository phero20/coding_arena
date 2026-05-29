import { create } from "zustand";
import { type ContestFilters } from "../types/contest";

interface ContestState {
  filters: ContestFilters;
  setPlatformFilter: (platform: string) => void;
  togglePlatformFilter: (platform: string) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

/**
 * Zustand store for managing Contest Hub UI state.
 * Handles filtering and search query persistence across the view.
 */
export const useContestStore = create<ContestState>((set) => ({
  filters: {
    platforms: [],
    search: "",
  },

  setPlatformFilter: (platform) =>
    set((state) => ({
      filters: {
        ...state.filters,
        platforms: [platform], // Single selection for now if needed, or update logic
      },
    })),

  togglePlatformFilter: (platform) =>
    set((state) => {
      const isSelected = state.filters.platforms.includes(platform);
      return {
        filters: {
          ...state.filters,
          platforms: isSelected
            ? state.filters.platforms.filter((p) => p !== platform)
            : [...state.filters.platforms, platform],
        },
      };
    }),

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),

  clearFilters: () =>
    set({
      filters: { platforms: [], search: "" },
    }),
}));
