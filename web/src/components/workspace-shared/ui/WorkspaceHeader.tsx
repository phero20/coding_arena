"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChevronLeft, Play, Send, RefreshCw, X, Pencil } from "lucide-react";
import type { WorkspaceHeaderProps } from "@/types/component.types";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
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
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";
import { PracticeStopwatch } from "./PracticeStopwatch";



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
  hideSubmit,
  hideRun,
  onToggleScratchpad,
  isScratchpadOpen,
  isArena: isArenaProp,
  allowUnauthenticatedRun,
}) => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleRun = () => {
    if (!userId && !allowUnauthenticatedRun) {
      router.push(`/auth/login?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }
    onRun?.();
  };

  const isInteractionDisabled =
    !isLoaded || isLoading || isSubmitting || hasSubmitted;

  const isArena = isArenaProp || !!onAbort;

  const renderActions = () => (
    <ButtonGroup orientation="horizontal" className="flex items-center">
      <Button
        variant={isScratchpadOpen ? "secondary" : "outline"}
        size="sm"
        type="button"
        onClick={onToggleScratchpad}
        className={cn(
          "hidden md:inline-flex px-2.5 md:px-3 h-8 md:h-9",
          isScratchpadOpen && "bg-primary/10 border-primary/30 text-primary",
        )}
        title="Toggle Scratchpad"
      >
        <Pencil className="size-3.5 md:mr-1" />
        <span className="hidden lg:inline">Scratchpad</span>
      </Button>
      {!hideRun && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={handleRun}
          disabled={isInteractionDisabled}
          className="px-2.5 md:px-3 h-8 md:h-9"
        >
          {isLoading ? (
            <RefreshCw className="size-3.5 md:mr-1 animate-spin" />
          ) : (
            <Play className="size-3.5 md:mr-1" />
          )}
          <span className="hidden lg:inline">Run</span>
        </Button>
      )}
      
      {!hideSubmit && renderSubmitButton()}
    </ButtonGroup>
  );

  const renderSubmitButton = () => {
    const submitBtn = (
      
      <Button
        size="sm"
        type="button"
        className="bg-primary text-primary-foreground hover:opacity-90 px-2.5 md:px-3 h-8 md:h-9"
        disabled={isInteractionDisabled}
        onClick={(e) => {
          if (!userId) {
            e.preventDefault();
            router.push(`/auth/login?redirect_url=${encodeURIComponent(pathname)}`);
            return;
          }
          if (!confirmSubmit && onSubmit) onSubmit();
        }}
      >
        {isSubmitting ? (
          <RefreshCw className="size-3.5 md:mr-1 animate-spin" />
        ) : (
          <Send className="size-3.5 md:mr-1" />
        )}
        <span className="hidden lg:inline">Submit</span>
      </Button>
    );

    if (!confirmSubmit) return submitBtn;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{submitBtn}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-md text-primary font-bold">
              Submit Final Solution?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              You have only 1 attempt. This will lock your current code and
              submit it for final evaluation. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs font-bold border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onSubmit}
              className="h-8 text-xs font-bold"
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
          
          {/* Desktop-only: Buttons attached to the timer's right (Practice Mode) */}
          {!isArena && (
            <div className="hidden md:flex">
              {renderActions()}
            </div>
          )}
        </div>
      </div>

      {/* Right: Mobile Buttons & Navbar Actions & Arena Actions */}
      <div className="z-10 flex-1 flex justify-end items-center gap-4">
        {!isArena ? (
          <div className="flex items-center gap-4">
            <PracticeStopwatch />
            <div className="hidden md:flex"><NavbarActions /></div>
          </div>
        ) : (
          <div className="hidden md:flex">
            {renderActions()}
          </div>
        )}
        <div className="flex md:hidden">
          {renderActions()}
        </div>
      </div>
    </header>
  );
};
