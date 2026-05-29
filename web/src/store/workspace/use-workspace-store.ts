import { create } from "zustand";

/**
 * Valid Main Tabs for the Workspace
 */
export type MainTab =
  | "description"
  | "hints"
  | "solutions"
  | "submissions"
  | "opponents";

/**
 * Valid Solution Sub-Tabs
 */
export type SolTab = "official" | "community" | "my-solutions";

interface WorkspaceState {
  // Current Tab States
  mainTab: MainTab;
  solTab: SolTab;
  selectedSolutionId: string | null;

  // Setters
  setMainTab: (tab: MainTab) => void;
  setSolTab: (tab: SolTab) => void;
  setSelectedSolutionId: (id: string | null) => void;

  // Global Reset (used when switching problems)
  reset: () => void;
}

/**
 * Helper to get initial state from URL (Client-side only)
 */
const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      mainTab: "description" as MainTab,
      solTab: "official" as SolTab,
      selectedSolutionId: null as string | null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    mainTab: (params.get("tab") as MainTab) || "description",
    solTab: (params.get("solTab") as SolTab) || "official",
    selectedSolutionId: params.get("solId") || null,
  };
};

const initialState = getInitialState();

/**
 * useWorkspaceStore
 * Centralized state for workspace navigation (tabs & sub-tabs).
 * This store is synced with the URL query parameters via the useWorkspaceSync hook.
 */
export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...initialState,

  setMainTab: (tab) => set({ mainTab: tab }),
  setSolTab: (tab) => set({ solTab: tab }),
  setSelectedSolutionId: (id) => set({ selectedSolutionId: id }),

  reset: () =>
    set({
      mainTab: "description",
      solTab: "official",
      selectedSolutionId: null,
    }),
}));
