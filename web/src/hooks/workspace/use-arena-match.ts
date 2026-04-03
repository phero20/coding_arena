import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useArenaStore } from "@/store/useArenaStore";
import { useEditorStore } from "@/store/use-editor-store";
import { useProblemEditor } from "./use-problem-editor";
import { useTaskEvaluation } from "./use-task-evaluation";
import { Problem } from "@/types/api";
import { useShallow } from "zustand/react/shallow";

import { useRouter } from "next/navigation";

export type MatchTab =
  | "result"
  | "description"
  | "submissions"
  | "code"
  | "testcase";

interface UseArenaMatchProps {
  problem: Problem;
  roomId: string;
}

export function useArenaMatch({ problem, roomId }: UseArenaMatchProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MatchTab>("code");
  const [isFullSubmission, setIsFullSubmission] = useState(false);
  const { userId } = useAuth();

  // 1. Store State
  const { room, matchId, updateEvaluation, setEvaluation, socket, matchEnded } =
    useArenaStore(
      useShallow((state) => ({
        room: state.room,
        matchId: state.matchId as string | null,
        evaluation: state.evaluation,
        updateEvaluation: state.updateEvaluation,
        setEvaluation: state.setEvaluation,
        socket: state.socket,
        matchEnded: state.matchEnded,
      })),
    );

  // 2. Observer for Match End (Signals UI to show overlay)
  useEffect(() => {
    if (matchEnded && room?.status === "FINISHED") {
      console.log("[Arena] Match concluded. UI should show overlay.");
    }
  }, [matchEnded, room?.status]);

  const me = userId ? room?.players[userId] : null;
  const hasSubmitted = me?.status === "SUBMITTED";

  // 3. Editor State
  const editor = useProblemEditor(
    problem,
    room?.language,
    matchId as string | null,
    true,
  );

  // 4. Unified Evaluation Hook
  const {
    run,
    submit,
    evaluation: hookEvaluation,
    isLoading,
  } = useTaskEvaluation({
    problemId: problem.problem_id,
    languageId: editor.language,
    mode: "arena",
    arenaMatchId: (matchId as string | null) ?? undefined,
    roomId: (roomId as string | null) ?? undefined,
  });

  // Sync hook evaluation back to store for global visibility (leaderboards, etc.)
  useEffect(() => {
    if (hookEvaluation.type) {
      updateEvaluation(hookEvaluation as any);
    }
  }, [hookEvaluation, updateEvaluation]);

  // 5. Action Handlers
  const runCode = useCallback(async () => {
    setActiveTab("result");
    setIsFullSubmission(false);
    run(editor.code);
  }, [editor.code, run]);

  const submitCode = useCallback(async () => {
    setActiveTab("result");
    setIsFullSubmission(true);
    submit(editor.code);
  }, [editor.code, submit]);

  const leaveRoom = useCallback(
    (shouldClearSession = false) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "LEAVE_ROOM" }));
      }
      setEvaluation(null);
      if (shouldClearSession && matchId) {
        // Clear the specific match session from the unified store
        useEditorStore.getState().clearSession(`arena:${matchId}`);
      }

      // Explicit reset and redirect
      useArenaStore.getState().reset();
      router.push("/arena");
    },
    [socket, setEvaluation, matchId, router],
  );

  return {
    // State
    room,
    editor,
    evaluation: hookEvaluation,
    activeTab,
    isFullSubmission,
    isLoading, // Export loading state for UI
    hasSubmitted,
    matchEnded,

    // Actions
    setActiveTab,
    runCode,
    submitCode,
    leaveRoom,
  };
}
