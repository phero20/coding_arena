"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runSubmission, submitCode } from "@/services/mutations/submission.mutations";
import { useSubmissionStatusQuery } from "@/hooks/queries/use-submission.queries";
import type { 
  ExecutionVerdict, 
  ExecutionTestResult,
  RunSubmissionResponse 
} from "@/types/submission";

export type EvaluationMode = "practice" | "arena";

interface UseTaskEvaluationArgs {
  problemId: string;
  languageId: string;
  mode?: EvaluationMode;
  arenaMatchId?: string | null;
  roomId?: string | null;
}

export interface EvaluationResult {
  submissionId: string | null;
  status: ExecutionVerdict | "PENDING" | "IDLE" | "ERROR";
  overallStatus: ExecutionVerdict | "PENDING" | "IDLE" | "ERROR"; // Alias for compatibility
  tests: ExecutionTestResult[];
  compileOutput?: string;
  stderr?: string;
  isLoading: boolean;
  error: string | null;
  type: "run" | "submit" | null;
}

const getErrorMessage = (err: any): string | null => {
  if (!err) return null;
  if (typeof err === "string") return err;
  
  const msg = err.message || "An unexpected error occurred";
  if (msg.includes("500") || msg.includes("Network Error")) {
    return "Internal Server Error: We could not evaluate your code due to high load. Please try again.";
  }
  
  return msg;
};

/**
 * Unified hook for both running samples and submitting code.
 * Handles Practice and Arena contexts consistently.
 */
export const useTaskEvaluation = ({
  problemId,
  languageId,
  mode = "practice",
  arenaMatchId,
  roomId,
}: UseTaskEvaluationArgs) => {
  const queryClient = useQueryClient();
  const [evaluationType, setEvaluationType] = useState<"run" | "submit" | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [lastRunResult, setLastRunResult] = useState<RunSubmissionResponse | null>(null);

  /**
   * Mutation for "Run" (Sample Tests)
   */
  const runMutation = useMutation({
    mutationKey: ["run-code", problemId, languageId],
    mutationFn: (sourceCode: string) =>
      runSubmission({
        problemId,
        languageId,
        sourceCode,
        arenaMatchId: mode === "arena" ? arenaMatchId : undefined,
      }),
    onMutate: () => {
      setEvaluationType("run");
      setSubmissionId(null);
      setLastRunResult(null);
    },
    onSuccess: (data) => {
      setLastRunResult(data);
    },
  });

  /**
   * Mutation for "Submit" (Full Evaluation)
   */
  const submitMutation = useMutation({
    mutationKey: ["submit-code", problemId, languageId, mode],
    mutationFn: (sourceCode: string) =>
      submitCode({
        problemId,
        languageId,
        sourceCode,
        arenaMatchId: mode === "arena" ? (arenaMatchId || undefined) : undefined,
      }),
    onMutate: () => {
      setEvaluationType("submit");
      setLastRunResult(null);
      setSubmissionId(null);
    },
    onSuccess: (data) => {
      setSubmissionId(data.submissionId);
    },
  });

  /**
   * Polling for "Submit" status
   */
  const { data: pollingData, isLoading: isPolling, error: pollingError } = useSubmissionStatusQuery(
    evaluationType === "submit" ? submissionId : null
  );

  const statusPolling = useMemo(() => {
    if (!pollingData) return null;
    return {
      overallStatus: pollingData.status || "PENDING",
      tests: pollingData.details?.tests ?? [],
      isLoading: isPolling,
      error: pollingError ? (pollingError as Error).message : null,
    };
  }, [pollingData, isPolling, pollingError]);

  /**
   * Derived states
   */
  const isLoading = 
    runMutation.isPending || 
    submitMutation.isPending || 
    isPolling || 
    ((pollingData?.status as string) === "PENDING");
  const error = getErrorMessage(runMutation.error || submitMutation.error || pollingError);

  const evaluation: EvaluationResult = useMemo(() => {
    if (evaluationType === "run") {
      const status = lastRunResult?.overallStatus || "PENDING";
      const isSystemError = status === "SYSTEM_ERROR";
      const systemErrorMessage = isSystemError 
        ? "Internal Server Error: We could not evaluate your code due to high load. Please try running again." 
        : null;

      return {
        submissionId: lastRunResult?.submissionId ?? null,
        status,
        overallStatus: status,
        tests: lastRunResult?.tests || [],
        compileOutput: lastRunResult?.compileOutput,
        stderr: lastRunResult?.stderr,
        isLoading: runMutation.isPending || (status as string) === "PENDING",
        error: getErrorMessage(runMutation.error) || systemErrorMessage,
        type: "run",
      };
    }

    if (evaluationType === "submit") {
      const status = statusPolling?.overallStatus || "PENDING";
      const isSystemError = status === "SYSTEM_ERROR";
      const systemErrorMessage = isSystemError 
        ? "Internal Server Error: We could not evaluate your code due to high load. Please try submitting again." 
        : null;

      return {
        submissionId: submissionId,
        status,
        overallStatus: status,
        tests: statusPolling?.tests || [],
        compileOutput: pollingData?.details?.compileOutput,
        stderr: pollingData?.details?.stderr,
        isLoading: submitMutation.isPending || (status as string) === "PENDING" || !!statusPolling?.isLoading,
        error: getErrorMessage(submitMutation.error || statusPolling?.error) || systemErrorMessage,
        type: "submit",
      };
    }

    return {
      submissionId: null,
      status: "IDLE",
      overallStatus: "IDLE",
      tests: [],
      isLoading: false,
      error: null,
      type: null,
    };
  }, [
    evaluationType, 
    lastRunResult, 
    submissionId, 
    statusPolling, 
    runMutation.isPending, 
    runMutation.error,
    submitMutation.isPending,
    submitMutation.error
  ]);

  /**
   * Actions
   */
  const run = useCallback((code: string) => {
    if (isLoading) return;
    submitMutation.reset();
    runMutation.reset();
    runMutation.mutate(code);
  }, [isLoading, runMutation, submitMutation]);

  const submit = useCallback((code: string) => {
    if (isLoading) return;
    runMutation.reset();
    submitMutation.reset();
    submitMutation.mutate(code);
  }, [isLoading, submitMutation, runMutation]);

  const reset = useCallback(() => {
    runMutation.reset();
    submitMutation.reset();
    setEvaluationType(null);
    setSubmissionId(null);
    setLastRunResult(null);
  }, [runMutation, submitMutation]);

  /**
   * Auto-invalidate queries on successful submission
   */
  useEffect(() => {
    if (evaluation.status !== "PENDING" && evaluation.type === "submit" && evaluation.submissionId) {
      queryClient.invalidateQueries({ queryKey: ["submissions", problemId] });
      queryClient.invalidateQueries({ queryKey: ["user-submissions", problemId] });
      queryClient.invalidateQueries({ queryKey: ["user-solved-problems"] });
    }
  }, [evaluation.status, evaluation.type, evaluation.submissionId, problemId, queryClient]);

  return {
    run,
    submit,
    reset,
    evaluation,
    isLoading,
    error: evaluation.error,
    isArena: mode === "arena",
  };
};
