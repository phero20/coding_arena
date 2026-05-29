import { create } from "zustand";

interface ProfileState {
  // UI State
  activeTab: string;
  socialType: "followers" | "following";
  arenaTab: "records" | "submissions";
  lastUsername?: string; // Track username for smart resets
  
  // Actions
  setActiveTab: (tab: string) => void;
  setSocialType: (type: "followers" | "following") => void;
  setArenaTab: (tab: "records" | "submissions") => void;
  
  // Logic Migrated to Store
  syncTab: (params: {
    value: string;
    router: any;
    pathname: string;
    searchParams: any;
    redirectSettings?: boolean;
  }) => void;
  
  initTab: (params: {
    tabParam: string | null;
    arenaSubTab?: string | null;
    router: any;
    pathname: string;
    searchParams: any;
    username?: string;
  }) => void;
  
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  activeTab: "stats",
  socialType: "followers",
  arenaTab: "records",
  lastUsername: undefined,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSocialType: (type) => set({ socialType: type, activeTab: "social" }),
  setArenaTab: (tab) => set({ arenaTab: tab, activeTab: "arena" }),

  syncTab: ({ value, router, pathname, searchParams, redirectSettings = true }) => {
    if (value === "settings" && redirectSettings) {
      router.push("/settings?tab=profile");
      return;
    }

    set({ activeTab: value });

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  },

  initTab: ({ tabParam, arenaSubTab, router, pathname, searchParams, username }) => {
    const validTabs = ["stats", "profile", "social", "arena", "submissions", "solutions", "settings", "appearance", "editor"];
    
    // If username changed, we should reset
    if (username && get().lastUsername !== username) {
      get().reset();
      set({ lastUsername: username });
    }

    if (arenaSubTab === "submissions") {
      set({ arenaTab: "submissions" });
    }

    // If no tab is present in URL, default to 'stats' and update URL
    if (!tabParam) {
      set({ activeTab: "stats" });
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "stats");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }

    if (validTabs.includes(tabParam)) {
      if (tabParam === "settings") {
        router.push("/settings?tab=profile");
      } else {
        set({ activeTab: tabParam });
      }
    }
  },

  reset: () => set({ activeTab: "stats", socialType: "followers", arenaTab: "records" }),
}));
