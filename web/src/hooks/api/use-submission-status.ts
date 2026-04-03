import { useQuery } from "@tanstack/react-query";
import { submissionService } from "@/services/submission.service";
import type { ExecutionVerdict, ExecutionTestResult } from "@/services/submission.service";
import { type ArenaEvaluation } from "@/store/useArenaStore";

/**
 * Hook for polling submission status using React Query.
 * Returns data in the ArenaEvaluation format for store consistency.
 */
export const useSubmissionStatus = (
  submissionId: string | null,
  options: { pollInterval?: number; disabled?: boolean } = {},
): ArenaEvaluation | null => {
  const { pollInterval = 500, disabled = false } = options;

  const { data, error, isLoading } = useQuery({
    queryKey: ["submission-status", submissionId],
    queryFn: () => submissionService.getSubmissionStatus(submissionId!),
    enabled: !!submissionId && !disabled,
    refetchInterval: (query) => {
      const submission = query.state.data;
      if (!submission) return pollInterval;
      
      const isFinished = 
        submission.status !== "PENDING" && 
        Array.isArray(submission.details?.tests);

      return isFinished ? false : pollInterval;
    },
    gcTime: 0,
    staleTime: 0,
  });

  if (!submissionId && !isLoading) return null;

  return {
    submissionId,
    overallStatus: (data?.status as any) || (isLoading ? "PENDING" : null),
    tests: data?.details?.tests || [],
    isLoading: isLoading && !data,
    error: error ? (error as Error).message : null,
  };
};


