import { useCallback, useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useArenaStore } from "@/store/useArenaStore";
import { useEditorStore } from "@/store/use-editor-store";
import { useProblemEditor } from "./use-problem-editor";
import { useTaskEvaluation } from "./use-task-evaluation";
import { Problem } from "@/types/api";
import { useShallow } from "zustand/react/shallow";
import { useRouter } from "next/navigation";
import { useLeaveArena } from "@/hooks/arena/use-arena-actions";

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

  // 3. Editor State (Atomic Context Lock)
  // Industry Standard: Key your session by both the identity (roomId) AND the mandated configuration (language).
  // If the language arrives late, the key CHANGES, forcing a fresh, correct initialization.
  const sessionId = useMemo(() => {
    if (!room?.language) return `arena:loading:${roomId}`;
    if (matchId) return `arena:${matchId}:${room.language}`;
    return `arena:room:${roomId}:${room.language}`;
  }, [matchId, roomId, room?.language]);

  const editor = useProblemEditor(
    problem,
    sessionId,
    room?.language,
    matchId as string | null,
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

  const leaveArenaAction = useLeaveArena();
  const leaveRoom = useCallback(() => {
    leaveArenaAction(true); // Hard-kill session cache on explicit exit
  }, [leaveArenaAction]);

  const abortMatch = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN && me?.isCreator) {
      socket.send(JSON.stringify({ type: "ABORT_MATCH" }));
    }
  }, [socket, me?.isCreator]);

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
    isHost: !!me?.isCreator,

    // Actions
    setActiveTab,
    runCode,
    submitCode,
    leaveRoom,
    abortMatch,
  };
}
