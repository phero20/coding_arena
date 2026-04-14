"use client";

import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Problem } from "@/types/api";
import { WorkspaceHeader } from "@/components/workspace-shared/WorkspaceHeader";

interface BaseWorkspaceProps {
  problem: Problem;
  descriptionSlot: React.ReactNode;
  editorSlot: React.ReactNode;
  onRun: () => void;
  onSubmit: () => void;
  onExit?: () => void;
  onAbort?: () => void;
  exitText?: string;
  endTime?: number | string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
  confirmSubmit?: boolean;
}

/**
 * Industrial-Standard Base Workspace Component.
 * Centralizes layout logic, resizable panels, and mobile stacking for ALL coding modes.
 */
export const BaseWorkspace: React.FC<BaseWorkspaceProps> = ({
  problem,
  descriptionSlot,
  editorSlot,
  onRun,
  onSubmit,
  onExit,
  onAbort,
  endTime,
  isLoading,
  isSubmitting,
  hasSubmitted,
  exitText,
  confirmSubmit,
}) => {
  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={problem}
        onRun={onRun}
        onSubmit={onSubmit}
        onExit={onExit}
        onAbort={onAbort}
        exitText={exitText}
        endTime={endTime}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        hasSubmitted={hasSubmitted}
        confirmSubmit={confirmSubmit}
      />

      {/* Desktop: standard resizable two-panel split */}
      <div className="flex-1 min-h-0 hidden md:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full items-stretch"
        >
          <ResizablePanel
            defaultSize={42}
            minSize={25}
            className="bg-card/30 backdrop-blur-md border-r border-border/40"
          >
            {descriptionSlot}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-border/20 hover:bg-primary/50 transition-colors"
          />

          <ResizablePanel defaultSize={58} minSize={30}>
            {editorSlot}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: stacked layout with smooth scroll support */}
      <div className="flex-1 flex flex-col md:hidden overflow-y-auto overflow-x-hidden relative custom-scrollbar">
        <section className="border-b border-border/40 bg-card/30 w-full shrink-0">
          {descriptionSlot}
        </section>
        <section className="flex-1 border-b border-border/40 bg-card/10">
          {editorSlot}
        </section>
      </div>
    </div>
  );
};
