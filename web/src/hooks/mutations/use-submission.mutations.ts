"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runSubmission, submitCode } from "@/services/mutations/submission.mutations";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

/**
 * Shared retry logic for Wake-on-Demand Judge0 polling.
 */
const submissionRetryConfig = {
  retry: (failureCount: number, error: any) => {
    const apiMessage = error?.response?.data?.error?.message || error?.message;
    if (apiMessage === "VM_WAKING_UP" && failureCount < 5) {
      if (failureCount === 0) {
        toast.loading("Waking up the Judge0 System from sleep... This first run will take ~30 seconds, but all future runs will be instant!", {
          id: "vm-waking-up",
          duration: 30000,
        });
      }
      return true;
    }
    return false;
  },
  retryDelay: 10000,
  onSettled: () => {
    toast.dismiss("vm-waking-up");
  },
};

/**
 * Mutation for immediate code playground execution (Dry-run).
 * Includes retry polling logic for Judge0 VM Wake-on-Demand.
 */
export function useRunMutation() {
  return useMutation({
    mutationFn: runSubmission,
    ...submissionRetryConfig,
  });
}

/**
 * Mutation for full submission evaluation against all test cases.
 * Includes retry polling logic for Judge0 VM Wake-on-Demand.
 */
export function useSubmitMutation() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: submitCode,
    onSuccess: (data: any) => {
      // Show the Toast if the backend detected the VM is waking up
      if (data?.isWakingUp) {
        toast.loading("Waking up the Judge0 System from sleep... This first run will take ~30 seconds, but all future runs will be instant!", {
          id: "vm-waking-up",
          duration: 30000,
        });
      }

      if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: ["stats", "profile", user.username],
        });
      }
    },
  });
}
