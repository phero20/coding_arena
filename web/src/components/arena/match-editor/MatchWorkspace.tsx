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
import { useRunSubmission } from "@/hooks/match-hooks/use-run-submission";
import { ArenaWSMessage } from "@/services/arena.service";
import { useEditorStore } from "@/store/match-store/use-editor-store";
import { useArenaStore } from "@/store/useArenaStore";
import { useShallow } from "zustand/react/shallow";
import { useUser } from "@clerk/nextjs";

interface MatchWorkspaceProps {
  problem: Problem;
  roomId: string;
  sendMessage: (type: ArenaWSMessage["type"], payload?: any) => void;
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
  const [activeTab, setActiveTab] = React.useState<
    "code" | "testcase" | "result"
  >("code");

  // Get current editor state from store with focused selectors
  const storeKey = roomId || problem.problem_id;
  const session = useEditorStore(
    useShallow((state) => state.sessions[storeKey])
  );
  const activeLanguage = session?.activeLanguage;
  const currentCode = session?.codes?.[activeLanguage || ""];

  const {
    data: runResult,
    isRunning,
    runAsync,
    error: runError,
    reset: resetRun,
  } = useRunSubmission({
    problemId: problem.problem_id,
    languageId: enforcedLanguage || activeLanguage || "javascript",
  });

  // In Arena mode, we don't hit the normal API for submission.
  // Instead, we just RUN the code, and if tests pass, we broadcast to WebSocket.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const room = useArenaStore(useShallow((state) => state.room));
  const { user } = useUser();

  const handleRun = React.useCallback(async () => {
    if (!currentCode || isRunning) return;
    try {
      await runAsync(currentCode);
      setActiveTab("result");
    } catch (err) {
      console.error("Run failed:", err);
      setActiveTab("result");
    }
  }, [currentCode, isRunning, runAsync]);

  const handleSubmit = React.useCallback(async () => {
    if (!currentCode || isSubmitting) return;
    try {
      setIsSubmitting(true);
      resetRun();

      // 1. Run the code locally against the judge
      const result = await runAsync(currentCode);
      setActiveTab("result");

      // 2. Count passed tests
      const passedTests = result.tests.filter(
        (t) => t.status === "ACCEPTED"
      ).length;
      const totalTests = result.tests.length;

      // 3. Broadcast progress so opponent sees it
      sendMessage("PROGRESS_UPDATE", {
        testsPassed: passedTests,
        totalTests: totalTests,
      });

      // 4. If everything passed, broadcast submission intent
      if (passedTests === totalTests && result.overallStatus === "ACCEPTED") {
        sendMessage("MATCH_SUBMITTED", {
          code: currentCode,
          language: activeLanguage,
        });
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setActiveTab("result");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCode, isSubmitting, resetRun, runAsync, sendMessage, activeLanguage]);

  // The runResult acts as both run & submit result in match mode
  const latestResult = runResult;
  const latestLoading = isRunning || isSubmitting;
  const latestError = runError;

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={problem}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onExit={onExit}
        isLoading={isRunning}
        isSubmitting={isSubmitting}
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
              room={room}
              currentUserId={user?.id}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-border/20 hover:bg-primary/50 transition-colors"
          />

          <ResizablePanel defaultSize={60} minSize={25}>
            <EditorPanel
              problem={problem}
              runResult={latestResult}
              isRunning={latestLoading}
              runError={latestError}
              activeTab={activeTab}
              onTabChange={setActiveTab}
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
            room={room}
            currentUserId={user?.id}
          />
        </section>
        <section className="border-b border-border/40 bg-card/10">
          <EditorPanel
            problem={problem}
            runResult={latestResult}
            isRunning={latestLoading}
            runError={latestError}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            enforcedLanguage={enforcedLanguage}
            roomId={roomId}
            sendMessage={sendMessage}
          />
        </section>
      </div>
    </div>
  );
};
