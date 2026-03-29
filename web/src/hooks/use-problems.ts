import { useQuery } from "@tanstack/react-query";
import { problemService } from "@/services/problem.service";
import type { Problem, PaginationMeta } from "@/types/api";

interface UseProblemsResult {
  problems: Problem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProblems = (page = 1, limit = 20): UseProblemsResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["problems", "list", page, limit],
    queryFn: () => problemService.getProblems(page, limit),
  });

  return {
    problems: (data?.problems ?? []).sort((a, b) => {
      const numA = Number(a.problem_id);
      const numB = Number(b.problem_id);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.problem_id.localeCompare(b.problem_id);
    }),
    meta: data?.meta ?? null,
    isLoading,
    error: error as Error | null,
  };
};
