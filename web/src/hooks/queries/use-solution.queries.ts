import { useQuery } from "@tanstack/react-query";
import { getSolutionsForProblem, getSolutionsByUser } from "@/services/queries/solution.queries";

export const solutionKeys = {
  all: ["solutions"] as const,
  problem: (problemId: string) => [...solutionKeys.all, "problem", problemId] as const,
  user: (username: string) => [...solutionKeys.all, "user", username] as const,
};

/**
 * Hook to fetch solutions for a specific problem.
 */
export function useProblemSolutions(problemId: string) {
  return useQuery({
    queryKey: solutionKeys.problem(problemId),
    queryFn: () => getSolutionsForProblem(problemId),
    enabled: !!problemId,
  });
}

/**
 * Hook to fetch all solutions authored by a specific user.
 */
export function useUserSolutions(username: string, limit: number = 10, offset: number = 0) {
  return useQuery({
    queryKey: [...solutionKeys.user(username), limit, offset],
    queryFn: () => getSolutionsByUser(username, limit, offset),
    enabled: !!username,
  });
}
