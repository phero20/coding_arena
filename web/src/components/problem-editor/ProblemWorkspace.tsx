"use client";

import React from "react";
<<<<<<< HEAD
import { DescriptionPanel } from "@/components/workspace-shared/DescriptionPanel";
import { EditorPanel } from "@/components/workspace-shared/EditorPanel";
import { Problem } from "@/types/api";
import { BaseWorkspace } from "@/components/shared/BaseWorkspace";
import { useRouter } from "next/navigation";
=======
import { DescriptionPanel, EditorPanel } from "@/components/workspace-shared";
import { Problem } from "@/types/api";
import { BaseWorkspace } from "@/components/shared/BaseWorkspace";
import { useRouter, useSearchParams } from "next/navigation";
>>>>>>> prod-deploy
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

<<<<<<< HEAD
  const handleExit = () => {
    router.push("/problem");
  };

=======
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const handleExit = () => {
    if (from === "roadmap") {
      router.push("/roadmap");
    } else {
      router.push("/problems");
    }
  };

  const exitText = from === "roadmap" ? "Roadmap" : "Problems";

>>>>>>> prod-deploy
  return (
    <BaseWorkspace
      problem={problem}
      onRun={runCode}
      onSubmit={submitCode}
      onExit={handleExit}
<<<<<<< HEAD
      exitText="Problems"
=======
      exitText={exitText}
>>>>>>> prod-deploy
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

