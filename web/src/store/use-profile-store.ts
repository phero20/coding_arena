import { create } from "zustand";

interface ProfileState {
  activeTab: string;
  socialType: "followers" | "following";
  setActiveTab: (tab: string) => void;
  setSocialType: (type: "followers" | "following") => void;
  reset: () => void;
}

/**
 * useProfileStore: Handles UI state for the profile view.
 * Prevents prop drilling for tabs and social filtering.
 */
export const useProfileStore = create<ProfileState>((set) => ({
  activeTab: "stats",
  socialType: "followers",
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setSocialType: (type) => set({ socialType: type, activeTab: "social" }),
  
  reset: () => set({ activeTab: "stats", socialType: "followers" }),
}));
