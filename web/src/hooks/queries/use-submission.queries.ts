"use client";

import { useEffect } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getSubmissionStatus, 
  getUserSubmissions,
  getRecentSubmissions
} from "@/services/queries/submission.queries";
import { useUser } from "@clerk/nextjs";

/**
 * Polling query to retrieve the finalized evaluation of a background execution.
 */
export function useSubmissionStatusQuery(submissionId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const query = useQuery({
    queryKey: ["submission-status", submissionId],
    queryFn: () => getSubmissionStatus(submissionId!),
    enabled: !!submissionId,
    // Polling logic when evaluating
    refetchInterval: (query: any) => {
      const data = query.state.data;
      if (data && data.status === "PENDING") {
        return 1000;
      }
      return false;
    }
  });

  const isFinished = query.data && query.data.status !== "PENDING";

  useEffect(() => {
    if (isFinished && user?.username) {
      queryClient.invalidateQueries({
        queryKey: ["stats", "profile", user.username],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-submissions-infinite"],
      });
    }
  }, [isFinished, user?.username, queryClient]);

  return query;
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

/**
 * Fetch the chronological history of recent submissions across all problems with Infinite Scrolling support.
 */
export function useRecentSubmissionsQuery(limit: number = 10, username?: string) {
  return useInfiniteQuery({
    queryKey: ["recent-submissions-infinite", limit, username],
    queryFn: ({ pageParam = 0 }) => getRecentSubmissions(limit, pageParam as number, username),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.pagination.offset + lastPage.pagination.limit;
      return nextOffset < lastPage.pagination.total ? nextOffset : undefined;
    },
  });
}
