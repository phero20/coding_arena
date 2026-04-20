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
  isLoading: boolean;
  error: string | null;
  type: "run" | "submit" | null;
}

const getErrorMessage = (err: any): string | null => {
  if (!err) return null;
  if (typeof err === "string") return err;
  return err.message || "An unexpected error occurred";
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
      overallStatus: (pollingData.status as any) || "PENDING",
      tests: pollingData.details?.tests || [],
      isLoading: isPolling,
      error: pollingError ? (pollingError as Error).message : null,
    };
  }, [pollingData, isPolling, pollingError]);

  /**
   * Derived states
   */
  const isLoading = runMutation.isPending || submitMutation.isPending || isPolling;
  const error = getErrorMessage(runMutation.error || submitMutation.error || pollingError);

  const evaluation: EvaluationResult = useMemo(() => {
    if (evaluationType === "run" && lastRunResult) {
      const status = (lastRunResult.overallStatus as any) || "ACCEPTED";
      return {
        submissionId: lastRunResult.submissionId,
        status,
        overallStatus: status,
        tests: lastRunResult.tests || [],
        isLoading: runMutation.isPending,
        error: getErrorMessage(runMutation.error),
        type: "run",
      };
    }

    if (evaluationType === "submit") {
      const status = (statusPolling?.overallStatus as any) || "PENDING";
      return {
        submissionId: submissionId,
        status,
        overallStatus: status,
        tests: statusPolling?.tests || [],
        isLoading: submitMutation.isPending || !!statusPolling?.isLoading,
        error: getErrorMessage(submitMutation.error || statusPolling?.error),
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
    runMutation.mutate(code);
  }, [isLoading, runMutation]);

  const submit = useCallback((code: string) => {
    if (isLoading) return;
    submitMutation.mutate(code);
  }, [isLoading, submitMutation]);

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
    }
  }, [evaluation.status, evaluation.type, evaluation.submissionId, problemId, queryClient]);

  return {
    run,
    submit,
    reset,
    evaluation,
    isLoading,
    error,
    isArena: mode === "arena",
  };
};
