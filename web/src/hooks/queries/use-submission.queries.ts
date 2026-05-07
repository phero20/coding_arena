"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubmissionStatus, getUserSubmissions } from "@/services/queries/submission.queries";

/**
 * Polling query to retrieve the finalized evaluation of a background execution.
 */
export function useSubmissionStatusQuery(submissionId: string | null) {
  return useQuery({
    queryKey: ["submission-status", submissionId],
    queryFn: () => getSubmissionStatus(submissionId!),
    enabled: !!submissionId,
    // Polling logic when evaluating
    refetchInterval: (query: any) => {
      const data = query.state.data;
      if (data && (data.overallStatus === "PENDING" || data.status === "PENDING")) {
        return 1000;
      }
      return false;
    }
  });
}

/**
 * Fetch the history of code submissions for a specific user and problem.
 */
export function useUserSubmissionsQuery(problemId: string) {
  return useQuery({
    queryKey: ["user-submissions", problemId],
    queryFn: () => getUserSubmissions(problemId),
    enabled: !!problemId,
  });
}
