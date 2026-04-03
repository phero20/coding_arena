import { useQuery } from "@tanstack/react-query";
import { problemTestService } from "@/services/problem-test.service";
import type { ProblemTest, ProblemTestType } from "@/types/api";

interface UseProblemTestsOptions {
  type?: ProblemTestType;
}

interface UseProblemTestsResult {
  tests: ProblemTest[] | ProblemTest | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProblemTests = (
  problemId: string | null | undefined,
  options?: UseProblemTestsOptions,
): UseProblemTestsResult => {
  const { data, isLoading, error } = useQuery<ProblemTest | ProblemTest[]>({
    queryKey: ["problem-tests", problemId, options?.type],
    queryFn: () =>
      options?.type
        ? problemTestService.getTestsForProblemAndType(problemId!, options.type)
        : problemTestService.getTestsForProblem(problemId!),
    enabled: !!problemId,
  });

  return {
    tests: data ?? null,
    isLoading,
    error: error as Error | null,
  };
};
