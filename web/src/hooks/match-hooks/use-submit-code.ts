"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submissionService, type SubmitCodeResponse } from "@/services/submission.service";
import { useSubmissionStatus } from "../use-submission-status";
import type { ExecutionVerdict, ExecutionTestResult } from "@/services/submission.service";

interface UseSubmitCodeArgs {
  problemId: string;
  languageId: string;
}

export interface SubmitCodeResult {
  submissionId: string;
  status: ExecutionVerdict | "PENDING";
  tests: ExecutionTestResult[] | null;
  executedAt: string;
}

/**
 * Hook for submitting code with automatic polling for results in Arena Matches
 */
export const useSubmitCode = ({ problemId, languageId }: UseSubmitCodeArgs) => {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationKey: ["match-submit-code", problemId, languageId],
    mutationFn: (sourceCode: string) =>
      submissionService.submitCode({
        problem_id: problemId,
        language_id: languageId,
        source_code: sourceCode,
      }),
    onSuccess: (response: SubmitCodeResponse) => {
      setSubmissionId(response.submissionId);
      setSubmittedAt(new Date().toISOString());
    },
  });

  const statusPolling = useSubmissionStatus(submissionId, {
    pollInterval: 500,
    autoStart: true,
  });

  const data: SubmitCodeResult | undefined = submissionId
    ? {
        submissionId,
        status: statusPolling.status || "PENDING",
        tests: statusPolling.tests,
        executedAt: submittedAt || new Date().toISOString(),
      }
    : undefined;

  const isSubmitting = submitMutation.isPending || statusPolling.isLoading;
  const error = (submitMutation.error || statusPolling.error) as Error | null;

  const reset = useCallback(() => {
    submitMutation.reset();
    setSubmissionId(null);
    setSubmittedAt(null);
  }, [submitMutation]);

  return {
    submitAsync: async (sourceCode: string) => {
      if (isSubmitting) return undefined;
      try {
        await submitMutation.mutateAsync(sourceCode);
        
        return new Promise<SubmitCodeResult>((resolvePromise) => {
          const checkStatus = () => {
            const hasStatus = statusPolling.status && statusPolling.status !== "PENDING";
            const hasTests = Array.isArray(statusPolling.tests) && statusPolling.tests.length > 0;
            
            if (hasStatus && hasTests) {
              setTimeout(() => {
                resolvePromise({
                  submissionId: submissionId || "",
                  status: statusPolling.status as ExecutionVerdict | "PENDING",
                  tests: statusPolling.tests,
                  executedAt: submittedAt || new Date().toISOString(),
                });
              }, 50);
            } else {
              setTimeout(checkStatus, 100);
            }
          };
          checkStatus();
        });
      } catch (err) {
        throw err;
      }
    },
    data,
    isSubmitting,
    error,
    status: statusPolling.status,
    tests: statusPolling.tests,
    reset,
  };
};
