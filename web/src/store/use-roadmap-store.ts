import { create } from "zustand";

interface RoadmapState {
  activeNodeId: string | null;
  /**
   * The root node ID that the user drilled into from the main tree.
   * Spawns the secondary tree.
   */
  drilledRootId: string | null;
  /**
   * IDs of nodes expanded inside the secondary tree.
   */
  expandedNodeIds: Set<string>;
  zoomLevel: number;

  setActiveNodeId: (id: string | null) => void;
  setDrilledRootId: (id: string | null) => void;
  toggleNodeExpansion: (id: string) => void;
  setZoomLevel: (level: number) => void;
  resetRoadmap: () => void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  activeNodeId: null,
  drilledRootId: null,
  expandedNodeIds: new Set<string>(),
  zoomLevel: 1,

  setActiveNodeId: (id) => set({ activeNodeId: id }),

  setDrilledRootId: (id) =>
    set((state) => {
      // If clicking the same root that's already drilled, collapse it
      if (state.drilledRootId === id) {
        return { drilledRootId: null, activeNodeId: null, expandedNodeIds: new Set() };
      }
      return { drilledRootId: id, activeNodeId: id, expandedNodeIds: new Set() };
    }),

  toggleNodeExpansion: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedNodeIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { expandedNodeIds: newSet, activeNodeId: id };
    }),

  setZoomLevel: (level) => set({ zoomLevel: level }),

  resetRoadmap: () =>
    set({
      activeNodeId: null,
      drilledRootId: null,
      expandedNodeIds: new Set<string>(),
      zoomLevel: 1,
    }),
}));
