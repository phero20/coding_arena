"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChevronLeft, Play, Send, RefreshCw, X } from "lucide-react";
import type { WorkspaceHeaderProps } from "@/types/component.types";
import { Problem } from "@/types/api";
import { useAuth } from "@clerk/nextjs";
import { MatchTimer } from "@/components/arena/MatchTimer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";



/**
 * WorkspaceHeader provides the top navigation and action controls for the problem editor.
 * It is fully responsive, showing only icons on small screens to prevent overflow.
 */
export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  problem,
  onRun,
  onSubmit,
  onExit,
  onAbort,
  exitText = "Exit",
  endTime,
  isLoading,
  isSubmitting,
  hasSubmitted,
  confirmSubmit,
}) => {
  const { isLoaded } = useAuth();
  const isInteractionDisabled =
    !isLoaded || isLoading || isSubmitting || hasSubmitted;

  // Debugging Blocked State removed as requested

  const renderActions = () => (
    <ButtonGroup orientation="horizontal" className="flex items-center">
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={onRun}
        disabled={isInteractionDisabled}
        className="px-2.5 md:px-3 h-8 md:h-9"
      >
        {isLoading ? (
          <RefreshCw className="size-3.5 md:mr-1 animate-spin" />
        ) : (
          <Play className="size-3.5 md:mr-1" />
        )}
        <span className="hidden md:inline">Run</span>
      </Button>
      {renderSubmitButton()}
    </ButtonGroup>
  );

  const renderSubmitButton = () => {
    const submitBtn = (
      <Button
        size="sm"
        type="button"
        className="bg-primary text-primary-foreground hover:opacity-90 px-2.5 md:px-3 h-8 md:h-9"
        disabled={isInteractionDisabled}
        onClick={!confirmSubmit ? onSubmit : undefined}
      >
        {isSubmitting ? (
          <RefreshCw className="size-3.5 md:mr-1 animate-spin" />
        ) : (
          <Send className="size-3.5 md:mr-1" />
        )}
        <span className="inline">Submit</span>
      </Button>
    );

    if (!confirmSubmit) return submitBtn;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{submitBtn}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">
              Submit Final Solution?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have only 1 attempt. This will lock your current code and
              submit it for final evaluation. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs font-bold border-border/40">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onSubmit}
              className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
            >
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <header className="relative h-14 px-2 md:px-4 border-b border-border/40 bg-card/20 backdrop-blur-sm flex items-center justify-between shrink-0">
      {/* Left: Exit/Back Button */}
      <div className="z-10 flex-1 flex justify-start items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 md:gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors h-8 md:h-9 px-2 md:px-3"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden md:inline">{exitText}</span>
        </Button>

        {onAbort && (
           <Button
             variant="destructive"
             size="sm"
             type="button"
             onClick={onAbort}
             className=""
           >
             <X className="size-3" strokeWidth={3} />
             <span className="hidden md:inline">Abort Match</span>
           </Button>
        )}
      </div>

      {/* Absolute Center: Timer (Always Centered) & Desktop Buttons */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Timer is permanently anchored to the exact screen center */}
          {endTime && <MatchTimer endTime={endTime} />}
          
          {/* Desktop-only: Buttons attached to the timer's right */}
          <div className="hidden md:flex">
            {renderActions()}
          </div>
        </div>
      </div>

      {/* Right: Mobile Buttons */}
      <div className="z-10 flex-1 flex justify-end">
        <div className="flex md:hidden">
          {renderActions()}
        </div>
      </div>
    </header>
  );
};
