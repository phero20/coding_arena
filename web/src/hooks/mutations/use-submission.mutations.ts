"use client";

import { useMutation } from "@tanstack/react-query";
import { runSubmission, submitCode } from "@/services/mutations/submission.mutations";

/**
 * Mutation for immediate code playground execution (Dry-run).
 */
export function useRunMutation() {
  return useMutation({
    mutationFn: runSubmission,
  });
}

/**
 * Mutation for full submission evaluation against all test cases.
 */
export function useSubmitMutation() {
  return useMutation({
    mutationFn: submitCode,
  });
}
