"use client";

<<<<<<< HEAD
import { useMutation } from "@tanstack/react-query";
import { runSubmission, submitCode } from "@/services/mutations/submission.mutations";
=======
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runSubmission, submitCode } from "@/services/mutations/submission.mutations";
import { useUser } from "@clerk/nextjs";
>>>>>>> prod-deploy

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
<<<<<<< HEAD
  return useMutation({
    mutationFn: submitCode,
=======
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
>>>>>>> prod-deploy
  });
}
