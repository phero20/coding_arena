import { useQuery } from "@tanstack/react-query";
import { problemService } from "@/services/problem.service";
import type { Problem } from "@/types/api";

interface UseProblemsByTopicResult {
  problems: Problem[];
  isLoading: boolean;
  error: Error | null;
}

export const useProblemsByTopic = (
  topic: string | null | undefined,
  limit?: number,
): UseProblemsByTopicResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["problems", "topic", topic, limit],
    queryFn: () => problemService.getProblemsByTopic(topic!, limit),
    enabled: !!topic,
  });

  return {
    problems: (data ?? []).sort((a, b) => {
      const numA = Number(a.problem_id);
      const numB = Number(b.problem_id);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.problem_id.localeCompare(b.problem_id);
    }),
    isLoading,
    error: error as Error | null,
  };
};
