"use client";

import React from "react";

import { DescriptionPanel, EditorPanel } from "@/components/workspace-shared";
import { BaseWorkspace } from "@/components/shared/BaseWorkspace";
import type { MatchWorkspaceProps } from "@/types/component.types";
import { useArenaMatch } from "@/hooks/workspace/use-arena-match";




export const MatchWorkspace: React.FC<MatchWorkspaceProps> = ({
  problem,
  roomId,
}) => {
  // Use the unified Arena Match hook (The "Console")
  const {
    editor,
    evaluation,
    activeTab,
    setActiveTab,
    runCode,
    submitCode,
    leaveRoom,
    abortMatch,
    isFullSubmission,
    room,
    isLoading,
    hasSubmitted,
    isHost,
  } = useArenaMatch({ problem, roomId });



  return (
    <BaseWorkspace
      problem={problem}
      onRun={runCode}
      onSubmit={submitCode}
      onExit={leaveRoom}
      onAbort={isHost ? abortMatch : undefined}
      exitText="Exit Match"
      endTime={room?.endTime}
      isLoading={!!evaluation?.isLoading && !isFullSubmission}
      isSubmitting={!!evaluation?.isLoading && isFullSubmission}
      hasSubmitted={hasSubmitted}
      confirmSubmit={true}
      isArena={true}
      descriptionSlot={
        <DescriptionPanel 
          mode="arena" 
          problem={problem} 
          room={room} 
          roomId={roomId}
        />
      }
      editorSlot={
        <EditorPanel
          mode="arena"
          problem={problem}
          runResult={evaluation as any}
          isRunning={isLoading}
          runError={evaluation?.error}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          roomId={roomId}
          enforcedLanguage={room?.language}
          verdict={evaluation.status as any}
          isEvaluating={isLoading && evaluation.type === "submit"}
          pollingTests={evaluation.type === "submit" ? evaluation.tests : null}
          hasSubmitted={hasSubmitted}
        />
      }
    />
  );
};
