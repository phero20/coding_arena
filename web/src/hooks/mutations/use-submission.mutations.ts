"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runSubmission, submitCode } from "@/services/mutations/submission.mutations";
import { useUser } from "@clerk/nextjs";

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
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: submitCode,
    onSuccess: () => {
      if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: ["stats", "profile", user.username],
        });
      }
    },
  });
}
