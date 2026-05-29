"use client";

<<<<<<< HEAD
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
=======
import { useEffect } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
>>>>>>> prod-deploy
import { 
  getSubmissionStatus, 
  getUserSubmissions,
  getRecentSubmissions
} from "@/services/queries/submission.queries";
<<<<<<< HEAD
=======
import { useUser } from "@clerk/nextjs";
>>>>>>> prod-deploy

/**
 * Polling query to retrieve the finalized evaluation of a background execution.
 */
export function useSubmissionStatusQuery(submissionId: string | null) {
<<<<<<< HEAD
  return useQuery({
=======
  const queryClient = useQueryClient();
  const { user } = useUser();

  const query = useQuery({
>>>>>>> prod-deploy
    queryKey: ["submission-status", submissionId],
    queryFn: () => getSubmissionStatus(submissionId!),
    enabled: !!submissionId,
    // Polling logic when evaluating
    refetchInterval: (query: any) => {
      const data = query.state.data;
<<<<<<< HEAD
      if (data && (data.overallStatus === "PENDING" || data.status === "PENDING")) {
=======
      if (data && data.status === "PENDING") {
>>>>>>> prod-deploy
        return 1000;
      }
      return false;
    }
  });
<<<<<<< HEAD
=======

  const isFinished = query.data && query.data.status !== "PENDING";

  useEffect(() => {
    if (isFinished && user?.username) {
      queryClient.invalidateQueries({
        queryKey: ["stats", "profile", user.username],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-submissions-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-submissions-paginated"],
      });
    }
  }, [isFinished, user?.username, queryClient]);

  return query;
>>>>>>> prod-deploy
}

/**
 * Fetch the history of code submissions for a specific user and problem.
 */
<<<<<<< HEAD
export function useUserSubmissionsQuery(problemId: string) {
  return useQuery({
    queryKey: ["user-submissions", problemId],
    queryFn: () => getUserSubmissions(problemId),
    enabled: !!problemId,
=======
export function useUserSubmissionsQuery(problemId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["user-submissions", problemId],
    queryFn: () => getUserSubmissions(problemId),
    enabled: !!problemId && enabled,
>>>>>>> prod-deploy
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
<<<<<<< HEAD
=======
/**
 * Fetch the chronological history of recent submissions with standard pagination support.
 */
export function useRecentSubmissionsPaginationQuery(limit: number = 10, offset: number = 0, username?: string) {
  return useQuery({
    queryKey: ["recent-submissions-paginated", limit, offset, username],
    queryFn: () => getRecentSubmissions(limit, offset, username),
  });
}
>>>>>>> prod-deploy
