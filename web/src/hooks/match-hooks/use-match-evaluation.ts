import { useState, useCallback } from "react";
import { useRunSubmission } from "./use-run-submission";
import { useSubmitCode } from "./use-submit-code";
import { ArenaWSMessage } from "@/services/arena.service";

interface UseMatchEvaluationProps {
  problemId: string;
  languageId: string;
  roomId?: string;
  sendMessage?: (type: ArenaWSMessage["type"], payload?: any) => void;
}

export const useMatchEvaluation = ({
  problemId,
  languageId,
  roomId,
  sendMessage,
}: UseMatchEvaluationProps) => {
  // Track if the most recent result is a full submission or just a run
  const [isFullSubmission, setIsFullSubmission] = useState(false);
  
  const {
    data: runResult,
    isRunning,
    runAsync,
    error: runError,
    reset: resetRun,
  } = useRunSubmission({
    problemId,
    languageId,
  });
  
  const {
    data: submitResult,
    isSubmitting,
    submitAsync,
    error: submitError,
    reset: resetSubmit,
  } = useSubmitCode({
    problemId,
    languageId,
  });

  const runCode = useCallback(async (code: string) => {
    if (!code || isRunning) return;
    try {
      setIsFullSubmission(false);
      resetSubmit(); // Clear full submission results
      return await runAsync(code);
    } catch (err) {
      console.error("Run failed:", err);
    }
  }, [isRunning, runAsync, resetSubmit]);

  const submitCode = useCallback(async (code: string) => {
    if (!code || isSubmitting) return;
    
    try {
      setIsFullSubmission(true);
      resetRun(); // Clear quick run results
      resetSubmit();

      // 1. Submit the code for full evaluation
      const result = await submitAsync(code);
      if (!result || !result.tests) return;

      // 2. Count passed tests
      const passedTests = result.tests.filter(
        (t) => t.status === "ACCEPTED"
      ).length;
      const totalTests = result.tests.length;

      // 3. Broadcast progress so opponent sees it
      if (sendMessage) {
        sendMessage("PROGRESS_UPDATE", {
          testsPassed: passedTests,
          totalTests: totalTests,
        });

        // 4. If everything passed, broadcast submission intent
        if (passedTests === totalTests && result.status === "ACCEPTED") {
          sendMessage("MATCH_SUBMITTED", {
            code,
            language: languageId,
          });
        }
      }

      return result;
    } finally {
      // isSubmitting is handled by useSubmitCode mutation state
    }
  }, [isSubmitting, resetRun, resetSubmit, submitAsync, sendMessage, languageId]);

  // Combine results for the UI
  const latestResult = isFullSubmission ? submitResult : runResult;
  const error = isFullSubmission ? submitError : runError;

  return {
    runCode,
    submitCode,
    latestResult,
    isRunning,
    isSubmitting,
    isFullSubmission,
    error,
  };
};
