"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { 
  getProblemBySlug, 
  getProblemById, 
  getProblemsByTopic, 
  getProblems,
  getUserSolvedProblems
} from "@/services/queries/problem.queries";
import { getTestsForProblemAndType } from "@/services/queries/problem-test.queries";

/**
 * Fetch a single problem based on its technical slug.
 */
export function useProblemQuery(slug: string) {
  return useQuery({
    queryKey: ["problem", slug],
    queryFn: () => getProblemBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Fetch a single problem specifically by its UUID.
 */
export function useProblemByIdQuery(id: string) {
  return useQuery({
    queryKey: ["problem-id", id],
    queryFn: () => getProblemById(id),
    enabled: !!id,
  });
}

/**
 * Fetch a bulk list of problems for tables or carousels (Paginated).
 */
export function useProblemsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["problems", page, limit],
    queryFn: () => getProblems(page, limit),
  });
}

/**
 * Fetch an infinite list of problems (for infinite scroll).
 */
export function useInfiniteProblemsQuery(
  limit = 20,
  filters?: { search?: string; topic?: string; difficulty?: string }
) {
  return useInfiniteQuery({
    queryKey: ["problems", "infinite", limit, filters],
    queryFn: ({ pageParam = 1 }) => getProblems(pageParam, limit, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // API response structure: { problems: Problem[], meta: ... }
      // If the backend returns fewer items than the requested limit, we are at the end!
      if (lastPage?.problems && lastPage.problems.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });
}

/**
 * Fetch problems filtered through a specific topic tag.
 */
export function useProblemsByTopicQuery(topic: string, limit?: number) {
  return useQuery({
    queryKey: ["problems-topic", topic, limit],
    queryFn: () => getProblemsByTopic(topic, limit),
    enabled: !!topic,
  });
}

/**
 * Fetch test cases for a problem filtered by visibility (e.g. PUBLIC).
 */
export function useProblemTestsQuery(problemId: string, type: any = "PUBLIC", enabled: boolean = true) {
  return useQuery({
    queryKey: ["problem-tests", problemId, type],
    queryFn: () => getTestsForProblemAndType(problemId, type),
    enabled: !!problemId && enabled,
  });
}

/**
 * Fetch all problems a specific user has solved.
 */
export function useUserSolvedProblemsQuery(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ["user-solved-problems", userId],
    queryFn: () => getUserSolvedProblems(userId!),
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
