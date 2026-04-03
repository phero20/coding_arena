import { useQuery } from "@tanstack/react-query";
import { problemService } from "@/services/problem.service";
import type { Problem } from "@/types/api";

interface UseProblemOptions {
  byId?: boolean;
}

interface UseProblemResult {
  problem: Problem | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProblem = (
  identifier: string | null | undefined,
  options?: UseProblemOptions,
): UseProblemResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["problem", options?.byId ? "id" : "slug", identifier],
    queryFn: () =>
      options?.byId
        ? problemService.getProblemById(identifier!)
        : problemService.getProblemBySlug(identifier!),
    enabled: !!identifier,
  });

  return {
    problem: data ?? null,
    isLoading,
    error: error as Error | null,
  };
};
