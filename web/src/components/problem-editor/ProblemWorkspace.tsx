"use client";

import React from "react";
import { DescriptionPanel } from "@/components/workspace-shared/DescriptionPanel";
import { EditorPanel } from "@/components/workspace-shared/EditorPanel";
import { Problem } from "@/types/api";
import { BaseWorkspace } from "@/components/shared/BaseWorkspace";
import { useRouter } from "next/navigation";
import { usePracticeWorkspace } from "@/hooks/workspace/use-practice-workspace";

import type { ProblemWorkspaceProps } from "@/types/component.types";

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  problem,
}) => {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    evaluation,
    isLoading,
    error,
    runCode,
    submitCode,
  } = usePracticeWorkspace({ problem });

  const handleExit = () => {
    router.push("/practice");
  };

  return (
    <BaseWorkspace
      problem={problem}
      onRun={runCode}
      onSubmit={submitCode}
      onExit={handleExit}
      exitText="Problems"
      isLoading={isLoading && evaluation.type === "run"}
      isSubmitting={isLoading && evaluation.type === "submit"}
      descriptionSlot={<DescriptionPanel mode="practice" problem={problem} />}
      editorSlot={
        <EditorPanel
          mode="practice"
          problem={problem}
          runResult={evaluation.type ? (evaluation as any) : null}
          isRunning={isLoading}
          runError={error}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          verdict={evaluation.status as any}
          isEvaluating={isLoading && evaluation.type === "submit"}
          pollingTests={evaluation.type === "submit" ? evaluation.tests : null}
        />
      }
    />
  );
};

