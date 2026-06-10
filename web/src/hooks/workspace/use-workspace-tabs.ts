"use client";

import { useMemo } from "react";
import { 
  BookOpen, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  Code2,
  LucideIcon
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export interface WorkspaceTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function useWorkspaceTabs(mode: "practice" | "arena" | "exercise") {
  const { isSignedIn } = useAuth();

  const tabs = useMemo(() => {

    const baseTabs: WorkspaceTab[] = [
      { id: "description", label: "Description", icon: BookOpen },
      { id: "hints", label: "Hints", icon: HelpCircle },
    ];
    
    if (mode === "arena") {
      return [...baseTabs, { id: "opponents", label: "Participants", icon: Users }];
    }
    
    const practiceTabs = [
      ...baseTabs,
      { id: "solutions", label: "Solutions", icon: CheckCircle2 },
    ];

    if (isSignedIn) {
      practiceTabs.push({ id: "submissions", label: "Submissions", icon: Code2 });
    }

    return practiceTabs;
  }, [mode, isSignedIn]);

  return tabs;
}
