"use client";

<<<<<<< HEAD
import { useQuery } from "@tanstack/react-query";
=======
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
>>>>>>> prod-deploy
import { 
  getProblemBySlug, 
  getProblemById, 
  getProblemsByTopic, 
<<<<<<< HEAD
  getProblems 
=======
  getProblems,
  getUserSolvedProblems
>>>>>>> prod-deploy
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
<<<<<<< HEAD
 * Fetch a bulk list of problems for tables or carousels.
=======
 * Fetch a bulk list of problems for tables or carousels (Paginated).
>>>>>>> prod-deploy
 */
export function useProblemsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["problems", page, limit],
<<<<<<< HEAD
    queryFn: async () => {
      const data = await getProblems(page, limit);
      return {
        ...data,
        problems: [...data.problems].sort((a, b) => {
          const numA = Number(a.problem_id);
          const numB = Number(b.problem_id);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.problem_id.localeCompare(b.problem_id);
        })
      };
=======
    queryFn: () => getProblems(page, limit),
  });
}

/**
 * Fetch an infinite list of problems (for infinite scroll).
 */
export function useInfiniteProblemsQuery(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["problems", "infinite", limit],
    queryFn: ({ pageParam = 1 }) => getProblems(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
>>>>>>> prod-deploy
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
<<<<<<< HEAD
export function useProblemTestsQuery(problemId: string, type: any = "PUBLIC") {
  return useQuery({
    queryKey: ["problem-tests", problemId, type],
    queryFn: () => getTestsForProblemAndType(problemId, type),
    enabled: !!problemId,
=======
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
>>>>>>> prod-deploy
  });
}
