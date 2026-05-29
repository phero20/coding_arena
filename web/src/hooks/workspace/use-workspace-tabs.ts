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

export interface WorkspaceTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

<<<<<<< HEAD
export function useWorkspaceTabs(mode: "practice" | "arena") {
  const tabs = useMemo(() => {
=======
export function useWorkspaceTabs(mode: "practice" | "arena" | "exercise") {
  const tabs = useMemo(() => {
    if (mode === "exercise") {
      return [
        { id: "description", label: "Description", icon: BookOpen },
        { id: "hints", label: "Hints", icon: HelpCircle },
        { id: "solutions", label: "Solutions", icon: CheckCircle2 },
      ];
    }

>>>>>>> prod-deploy
    const baseTabs: WorkspaceTab[] = [
      { id: "description", label: "Description", icon: BookOpen },
      { id: "hints", label: "Hints", icon: HelpCircle },
    ];
    
    if (mode === "arena") {
      return [...baseTabs, { id: "opponents", label: "Participants", icon: Users }];
    }
    
    return [
      ...baseTabs,
      { id: "solutions", label: "Solutions", icon: CheckCircle2 },
      { id: "submissions", label: "Submissions", icon: Code2 },
    ];
  }, [mode]);

  return tabs;
}
