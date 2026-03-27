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
import { useRunSubmission } from "@/hooks/use-run-submission";
import { useSubmitCode } from "@/hooks/use-submit-code";
import { useEditorStore } from "@/store/use-editor-store";

interface ProblemWorkspaceProps {
  problem: Problem;
}

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  problem,
}) => {
  const [activeTab, setActiveTab] = React.useState<"code" | "testcase" | "result">(
    "code",
  );

  // Get current editor state from store
  const session = useEditorStore((state) => state.sessions[problem.problem_id]);
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
    languageId: activeLanguage || "javascript",
  });

  const {
    data: submitResult,
    isSubmitting,
    submitAsync,
    error: submitError,
    reset: resetSubmit,
  } = useSubmitCode({
    problemId: problem.problem_id,
    languageId: activeLanguage || "javascript",
  });

  const handleRun = async () => {
    if (!currentCode || isRunning) return;
    try {
      resetSubmit(); // Clear previous submission result
      await runAsync(currentCode);
      setActiveTab("result");
    } catch (err) {
      console.error("Run failed:", err);
      setActiveTab("result");
    }
  };

  const handleSubmit = async () => {
    if (!currentCode || isSubmitting) return;
    try {
      resetRun(); // Clear previous run result
      await submitAsync(currentCode);
      setActiveTab("result");
    } catch (err) {
      console.error("Submission failed:", err);
      setActiveTab("result");
    }
  };

  // The latest result will now be the only one present due to mutual resets
  const latestResult = submitResult || runResult;
  const latestLoading = isRunning || isSubmitting;
  const latestError = submitError || runError;

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={problem}
        onRun={handleRun}
        onSubmit={handleSubmit}
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
            <DescriptionPanel problem={problem} />
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
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: stacked layout - scrollable container to support sticky children */}
      <div className="flex-1 flex flex-col md:hidden overflow-y-auto overflow-x-hidden relative custom-scrollbar">
        <section className="border-b border-border/40 bg-card/30 w-full ">
          <DescriptionPanel problem={problem} />
        </section>
        <section className="border-b border-border/40 bg-card/10">
          <EditorPanel
            problem={problem}
            runResult={latestResult}
            isRunning={latestLoading}
            runError={latestError}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </section>
      </div>
    </div>
  );
};
