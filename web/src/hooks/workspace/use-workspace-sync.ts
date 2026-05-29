"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWorkspaceStore, MainTab, SolTab } from "@/store/workspace/use-workspace-store";

/**
 * useWorkspaceSync
 * A synchronization hook that keeps the useWorkspaceStore and the URL Query Params in perfect harmony.
 */
export function useWorkspaceSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { 
    mainTab, 
    solTab, 
    selectedSolutionId, 
    setMainTab, 
    setSolTab, 
    setSelectedSolutionId 
  } = useWorkspaceStore();

  const isInitialized = useRef(false);

  // 1. INITIAL SYNC (URL -> Store)
  // This runs only once on mount to establish the store state from the URL.
  useEffect(() => {
    const urlTab = searchParams.get("tab") as MainTab;
    const urlSolTab = searchParams.get("solTab") as SolTab;
    const urlSolId = searchParams.get("solId");

    if (urlTab) setMainTab(urlTab);
    if (urlSolTab) setSolTab(urlSolTab);
    if (urlSolId) setSelectedSolutionId(urlSolId);
    
    // Mark as initialized so the second effect can start syncing Store -> URL
    isInitialized.current = true;
  }, []); // Run only once on mount

  // 2. REACTIVE SYNC (Store -> URL)
  // This runs whenever the store state changes (usually by user clicking tabs).
  useEffect(() => {
    // Prevent syncing the default store state back to the URL until the initial URL sync is done.
    if (!isInitialized.current) return;

    const params = new URLSearchParams(searchParams.toString());
    const currentTab = params.get("tab");
    const currentSolTab = params.get("solTab");
    const currentSolId = params.get("solId");

    let needsUpdate = false;

    // Check Main Tab
    if (mainTab && mainTab !== currentTab) {
      params.set("tab", mainTab);
      needsUpdate = true;
    }

    // Check Solutions Sub-tabs (Only if on solutions tab)
    if (mainTab === "solutions") {
      if (solTab && solTab !== currentSolTab) {
        params.set("solTab", solTab);
        needsUpdate = true;
      }
      if (selectedSolutionId !== currentSolId) {
        if (selectedSolutionId) {
          params.set("solId", selectedSolutionId);
        } else {
          params.delete("solId");
        }
        needsUpdate = true;
      }
    } else {
      // Remove solution params if we are not on the solutions tab
      if (params.has("solTab") || params.has("solId")) {
        params.delete("solTab");
        params.delete("solId");
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [mainTab, solTab, selectedSolutionId, pathname, router, searchParams]);

  return { mainTab, solTab, selectedSolutionId };
}
