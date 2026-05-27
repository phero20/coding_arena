"use client";

import React, { useMemo } from "react";
import { DescriptionPanel } from "@/components/workspace-shared";
import { AcademyEditorPanel } from "./AcademyEditorPanel";
import { BaseWorkspace } from "@/components/shared/BaseWorkspace";
import { useRouter } from "next/navigation";
import type { TrackExerciseResponse, ExerciseRunResult } from "@/types/academy";
import type { Problem } from "@/types/api";
import { useRunAcademyExerciseMutation } from "@/hooks/mutations/use-academy.mutations";
import { useEditorStore } from "@/store/use-editor-store";
import { useState, useEffect } from "react";

export interface AcademyWorkspaceProps {
  exercise: TrackExerciseResponse;
  trackSlug: string;
}

export const AcademyWorkspace: React.FC<AcademyWorkspaceProps> = ({
  exercise,
  trackSlug,
}) => {
  const router = useRouter();

  // Map the Academy TrackExerciseResponse to the Problem interface expected by workspace-shared
  const problemData = useMemo<Problem>(() => {
    return {
      problem_id: exercise.id, // Use slug as ID
      title: exercise.name,
      difficulty: exercise.difficulty as any,
      problem_slug: exercise.slug,
      topics: exercise.concepts ?? [],
      description: exercise.instructions || exercise.blurb || "",
      examples: [], // Can parse from instructions if needed, but empty array is fine
      constraints: [],
      follow_ups: [],
      hints: exercise.hints ? [exercise.hints] : [],
      code_snippets: {
        [trackSlug]: exercise.starter_code || "",
      },
      function_signature: {
        name: "", // Not strictly needed for UI display if using raw starter code
        return_type: "",
        params: [],
      },
      solutions: exercise.example_solution || undefined,
      source: exercise.source || undefined,
      source_url: exercise.source_url || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [exercise, trackSlug]);

  const [runResult, setRunResult] = useState<ExerciseRunResult | null>(null);
  const [runError, setRunError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "testcase" | "result">("code");

  const { mutate: runExercise, isPending } = useRunAcademyExerciseMutation({
    trackSlug,
    exerciseSlug: exercise.slug,
  });

  const handleRun = () => {
    const sessionId = `academy:${exercise.id}`;
    const session = useEditorStore.getState().sessions[sessionId];
    
    // In Academy, language might be tied to trackSlug if snippet doesn't exist yet
    const snippetLanguages = Object.keys(problemData.code_snippets || {});
    const fallbackLang = snippetLanguages.length > 0 ? snippetLanguages[0] : trackSlug;
    const currentLanguage = session?.activeLanguage || fallbackLang;
    
    const userCode = session?.codes[currentLanguage] || "";

    runExercise(
      { userCode, testCode: exercise.test_code || "" },
      {
        onSuccess: (data) => {
          setRunResult(data);
          setRunError(null);
          setActiveTab("result");
        },
        onError: (err) => {
          setRunError(err);
          setRunResult(null);
          setActiveTab("result");
        },
      }
    );
  };

  const handleSubmit = () => {
    // For academy, Submit is the same as Run
    handleRun();
  };

  const handleExit = () => {
    router.push(`/academy/tracks/${trackSlug}?tab=practice`);
  };

  return (
    <BaseWorkspace
      problem={problemData}
      onRun={handleRun}
      onSubmit={handleSubmit}
      onExit={handleExit}
      exitText={`Practice`}
      isLoading={false}
      isSubmitting={isPending}
      hideRun={true}
      descriptionSlot={<DescriptionPanel mode="exercise" problem={problemData} trackSlug={trackSlug} />}
      editorSlot={
        <AcademyEditorPanel
          exercise={exercise}
          problemData={problemData}
          trackSlug={trackSlug}
          runResult={runResult}
          isExecutionRunning={isPending}
          runError={runError}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
    />
  );
};
