import { create } from "zustand";
import type { Workspace, Diagram } from "@/types/workspace";
import { useChatStore } from "./use-chat-store";

interface DiagramStoreState {
  // Current active workspace and diagram context in the client app
  activeWorkspace: Workspace | null;
  activeDiagram: Diagram | null;

  // Background auto-save status indicators
  saveStatus: "saved" | "saving" | "error";
  lastSavedAt: Date | null;

  // Global state actions
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setActiveDiagram: (diagram: Diagram | null) => void;
  setSaveStatus: (status: "saved" | "saving" | "error") => void;
  setLastSavedAt: (date: Date | null) => void;

  // Reset the system state on exit/switch
  reset: () => void;
}

/**
 * useDiagramStore
 * Manages active workspaces, diagrams, and auto-save indicators in Next.js.
 */
export const useDiagramStore = create<DiagramStoreState>((set, get) => ({
  activeWorkspace: null,
  activeDiagram: null,
  saveStatus: "saved",
  lastSavedAt: null,

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setActiveDiagram: (diagram) => {
    const current = get().activeDiagram;
    // Reset chat store whenever diagram changes (different ID) or is cleared
    if (current?.id !== diagram?.id) {
      useChatStore.getState().reset();
    }
    set({ activeDiagram: diagram });
  },
  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),

  reset: () => set({
    activeWorkspace: null,
    activeDiagram: null,
    saveStatus: "saved",
    lastSavedAt: null,
  }),
}));
