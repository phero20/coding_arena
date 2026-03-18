"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionService, type SubmitCodeResponse } from "@/services/submission.service";
import { useSubmissionStatus, type SubmissionStatusState } from "./use-submission-status";
import type { ExecutionVerdict, ExecutionTestResult } from "@/services/submission.service";

interface UseSubmitCodeArgs {
  problemId: string;
  languageId: string;
}

/**
 * Complete submission result including status and test details
 */
export interface SubmitCodeResult {
  submissionId: string;
  status: ExecutionVerdict | "PENDING";
  tests: ExecutionTestResult[] | null;
  executedAt: string;
}

/**
 * Hook for submitting code with automatic polling for results
 * 
 * Flow:
 * 1. User calls submitAsync(sourceCode)
 * 2. API returns {submissionId, status: 'PENDING'} immediately
 * 3. Hook auto-starts polling getSubmissionStatus()
 * 4. When status changes from PENDING, polling stops
 * 5. Final result is available in data
 * 
 * @example
 * const { submitAsync, data, isSubmitting, status } = useSubmitCode({...})
 * 
 * // Submit code
 * await submitAsync(code)
 * 
 * // Show status
 * {isSubmitting ? "⏳ Evaluating..." : status}
 */
export const useSubmitCode = ({ problemId, languageId }: UseSubmitCodeArgs) => {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  /**
   * Mutation for initial submit call
   * Returns immediately with submission ID
   */
  const submitMutation = useMutation({
    mutationKey: ["submit-code", problemId, languageId],
    mutationFn: (sourceCode: string) =>
      submissionService.submitCode({
        problem_id: problemId,
        language_id: languageId,
        source_code: sourceCode,
      }),
    onSuccess: (response: SubmitCodeResponse) => {
      // Store submission ID for polling
      setSubmissionId(response.submissionId);
      setSubmittedAt(new Date().toISOString());
    },
  });

  /**
   * Poll for submission status
   * Automatically starts/stops based on submissionId
   */
  const statusPolling = useSubmissionStatus(submissionId, {
    pollInterval: 500,
    autoStart: true,
  });

  /**
   * Combine submission and polling data into final result
   */
  const data: SubmitCodeResult | undefined = submissionId
    ? {
        submissionId,
        status: statusPolling.status || "PENDING",
        tests: statusPolling.tests,
        executedAt: submittedAt || new Date().toISOString(),
      }
    : undefined;

  /**
   * Determine loading state
   * - Pending while initial submit is happening
   * - Loading while polling (status is PENDING)
   */
  const isSubmitting = submitMutation.isPending || statusPolling.isLoading;

  /**
   * Error from either submit or polling
   */
  const error = (submitMutation.error || statusPolling.error) as Error | null;

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    submitMutation.reset();
    setSubmissionId(null);
    setSubmittedAt(null);
  }, [submitMutation]);

  /**
   * Refresh submission history when done
   */
  useEffect(() => {
    if (
      statusPolling.status &&
      statusPolling.status !== "PENDING" &&
      submissionId
    ) {
      // Invalidate submission history to show new submission
      queryClient.invalidateQueries({ queryKey: ["submissions", problemId] });
    }
  }, [statusPolling.status, submissionId, problemId, queryClient]);

  return {
    /**
     * Submit code (returns immediately, starts polling internally)
     */
    submit: (sourceCode: string) => {
      if (isSubmitting) return;
      submitMutation.mutate(sourceCode);
    },

    /**
     * Submit code asynchronously (promise-based)
     * Waits for BOTH status and tests to be available before resolving
     */
    submitAsync: async (sourceCode: string) => {
      if (isSubmitting) return undefined;
      try {
        await submitMutation.mutateAsync(sourceCode);
        // Poll until done (wait for status to change AND tests to be populated)
        // This prevents returning early before the worker finishes writing to DB
        return new Promise<SubmitCodeResult>((resolvePromise) => {
          const checkStatus = () => {
            const hasStatus = statusPolling.status && statusPolling.status !== "PENDING";
            const hasTests = Array.isArray(statusPolling.tests) && statusPolling.tests.length > 0;
            
            // Only resolve when BOTH status is complete AND tests are populated
            if (hasStatus && hasTests) {
              // Add extra tick to ensure React batch updates are processed
              // This prevents UI flicker from stale data
              setTimeout(() => {
                resolvePromise({
                  submissionId: submissionId || "",
                  status: statusPolling.status as ExecutionVerdict | "PENDING",
                  tests: statusPolling.tests,
                  executedAt: submittedAt || new Date().toISOString(),
                });
              }, 50); // Extra 50ms to ensure React renders state changes
            } else {
              // Check again soon
              setTimeout(checkStatus, 100);
            }
          };
          checkStatus();
        });
      } catch (err) {
        throw err;
      }
    },

    // State
    data,
    isSubmitting,
    error,
    status: statusPolling.status,
    tests: statusPolling.tests,
    submissionId,

    // Controls
    reset,
  };
};
