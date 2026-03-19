"use client";

import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DescriptionPanel } from "./DescriptionPanel";
import { EditorPanel } from "./EditorPanel";
import { Problem } from "@/types/api";
import { WorkspaceHeader } from "./WorkspaceHeader";

// New custom hooks
import { useMatchEvaluation } from "@/hooks/match-hooks/use-match-evaluation";
import { useMatchSync } from "@/hooks/match-hooks/use-match-sync";
import { useProblemEditor } from "@/hooks/match-hooks/use-problem-editor";

interface MatchWorkspaceProps {
  problem: Problem;
  roomId: string;
  sendMessage: (type: any, payload?: any) => void;
  onExit?: () => void;
  enforcedLanguage?: string;
}

export const MatchWorkspace: React.FC<MatchWorkspaceProps> = ({
  problem,
  roomId,
  sendMessage,
  onExit,
  enforcedLanguage,
}) => {
  // 1. Editor State (Lifting this ensure run/submit has the latest code)
  const editor = useProblemEditor(
    problem,
    enforcedLanguage,
    roomId,
    sendMessage,
  );

  // 2. Evaluation Logic (Run / Submit / Poll / Arena Sync)
  const evaluation = useMatchEvaluation({
    problemId: problem.problem_id,
    languageId: enforcedLanguage || editor.language,
    roomId,
    sendMessage,
  });

  // 3. Normalize results to ensure all UI components/hooks see the same structure (overallStatus, tests)
  const normalizedResult = evaluation.latestResult ? {
    submissionId: (evaluation.latestResult as any).submissionId,
    overallStatus: (evaluation.latestResult as any).status || (evaluation.latestResult as any).overallStatus,
    tests: (evaluation.latestResult.tests as any[]) || [],
    isFullSubmission: evaluation.isFullSubmission
  } : null;

  // 4. Sync & UI (Leaderboard / Tab Switching / Match End)
  const sync = useMatchSync({
    submitStatus: normalizedResult?.overallStatus,
    submitTests: normalizedResult?.tests,
    isArena: !!roomId,
  });

  // Action handlers
  const handleRun = React.useCallback(async () => {
    try {
      await evaluation.runCode(editor.code);
      sync.setActiveTab("result");
    } catch (err) {
      sync.setActiveTab("result");
    }
  }, [evaluation, editor.code, sync]);

  const handleSubmit = React.useCallback(async () => {
    try {
      sync.setActiveTab("result");
      await evaluation.submitCode(editor.code);
    } catch (err) {
      sync.setActiveTab("result");
    }
  }, [evaluation, editor.code, sync]);

  // The latest states used for UI props
  const latestLoading = evaluation.isRunning || evaluation.isSubmitting;
  const latestError = evaluation.error;

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={problem}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onExit={onExit}
        isLoading={evaluation.isRunning}
        isSubmitting={evaluation.isSubmitting}
      />

      {/* Desktop: resizable two-panel split */}
      <div className="flex-1 min-h-0 hidden md:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full items-stretch"
        >
          <ResizablePanel
            defaultSize={40}
            minSize={25}
            className="bg-card/30 backdrop-blur-md border-r border-border/40"
          >
            <DescriptionPanel
              problem={problem}
              room={sync.room}
              currentUserId={sync.currentUser?.id}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-border/20 hover:bg-primary/50 transition-colors"
          />

          <ResizablePanel defaultSize={60} minSize={25}>
            <EditorPanel
              problem={problem}
              runResult={normalizedResult as any}
              isRunning={latestLoading}
              runError={latestError}
              activeTab={sync.activeTab}
              onTabChange={sync.setActiveTab}
              enforcedLanguage={enforcedLanguage}
              roomId={roomId}
              sendMessage={sendMessage}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: stacked layout - scrollable container to support sticky children */}
      <div className="flex-1 flex flex-col md:hidden overflow-y-auto overflow-x-hidden relative custom-scrollbar">
        <section className="border-b border-border/40 bg-card/30 w-full ">
          <DescriptionPanel
            problem={problem}
            room={sync.room}
            currentUserId={sync.currentUser?.id}
          />
        </section>
        <section className="border-b border-border/40 bg-card/10">
          <EditorPanel
            problem={problem}
            runResult={normalizedResult as any}
            isRunning={latestLoading}
            runError={latestError}
            activeTab={sync.activeTab}
            onTabChange={sync.setActiveTab}
            enforcedLanguage={enforcedLanguage}
            roomId={roomId}
            sendMessage={sendMessage}
          />
        </section>
      </div>
    </div>
  );
};
