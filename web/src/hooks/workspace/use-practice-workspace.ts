import { useState, useCallback } from "react";
import { useTaskEvaluation } from "./use-task-evaluation";
import { useProblemEditor } from "./use-problem-editor";
import { Problem } from "@/types/api";

interface UsePracticeWorkspaceProps {
  problem: Problem;
}

export function usePracticeWorkspace({ problem }: UsePracticeWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"code" | "testcase" | "result">("code");

  // Use the unified editor hook (handles practice: prefix and hydration)
  const sessionId = `practice:${problem.problem_id}`;
  const { code, language, isRunning: isEditorRunning } = useProblemEditor(problem, sessionId);

  const {
    run,
    submit,
    reset,
    evaluation,
    isLoading: isEvaluationLoading,
    error,
  } = useTaskEvaluation({
    problemId: problem.problem_id,
    languageId: language,
    mode: "practice",
  });

  const isLoading = isEditorRunning || isEvaluationLoading;

  const runCode = useCallback(async () => {
    if (!code || isLoading) return;
    setActiveTab("result");
    run(code);
  }, [code, isLoading, run]);

  const submitCode = useCallback(async () => {
    if (!code || isLoading) return;
    setActiveTab("result");
    submit(code);
  }, [code, isLoading, submit]);

  return {
    // State
    activeTab,
    evaluation,
    isLoading,
    error,
    
    // Actions
    setActiveTab,
    runCode,
    submitCode,
    resetEvaluation: reset,
  };
}

