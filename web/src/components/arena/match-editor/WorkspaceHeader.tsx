"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChevronLeft, Play, Send, RefreshCw } from "lucide-react";
import { Problem } from "@/types/api";
import { useAuth } from "@clerk/nextjs";

interface WorkspaceHeaderProps {
  problem: Problem;
  onRun?: () => void;
  onSubmit?: () => void;
  onExit?: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

/**
 * WorkspaceHeader provides the top navigation and action controls for the problem editor.
 * It is fully responsive, showing only icons on small screens to prevent overflow.
 */
export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  problem,
  onRun,
  onSubmit,
  onExit,
  isLoading,
  isSubmitting,
}) => {
  const { isLoaded } = useAuth();
  const isInteractionDisabled = !isLoaded || isLoading || isSubmitting;

  return (
    <header className="h-14 px-4 border-b border-border/40 bg-card/20 backdrop-blur-sm flex items-center justify-between gap-4 shrink-0">
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={onExit}
        className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
      >
        <ChevronLeft className="size-3.5 md:mr-2" />
        <span className="hidden md:inline">Exit Match</span>
      </Button>

      <ButtonGroup orientation="horizontal" className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onRun}
          disabled={isInteractionDisabled}
        >
          {isLoading ? (
            <RefreshCw className="size-3.5 md:mr-1 animate-spin" />
          ) : (
            <Play className="size-3.5 md:mr-1" />
          )}
          Run
        </Button>
        <Button
          size="sm"
          type="button"
          onClick={onSubmit}
          disabled={isInteractionDisabled}
          className="bg-primary text-primary-foreground hover:opacity-90"
        >
          {isSubmitting ? (
            <RefreshCw className="size-3.5 md:mr-1 animate-spin" />
          ) : (
            <Send className="size-3.5 md:mr-1" />
          )}
          Submit
        </Button>
      </ButtonGroup>

      {/* Spacer to balance the layout */}
      <div className="w-10 md:w-16 shrink-0" />
    </header>
  );
};
