import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runAcademyExercise } from "@/services/mutations/academy.mutations";
import type { RunAcademyExerciseDto, ExerciseRunResult } from "@/types/academy";

interface UseRunAcademyExerciseParams {
  trackSlug: string;
  exerciseSlug: string;
}

export function useRunAcademyExerciseMutation({
  trackSlug,
  exerciseSlug,
}: UseRunAcademyExerciseParams) {
  const queryClient = useQueryClient();

  return useMutation<ExerciseRunResult, Error, RunAcademyExerciseDto>({
    mutationFn: (payload) => runAcademyExercise(trackSlug, exerciseSlug, payload),
    onSuccess: (data) => {
      // Always invalidate stats to update activity heatmap, points, and streaks
      queryClient.invalidateQueries({
        queryKey: ["stats"],
      });

      // Always invalidate recent submissions since a new execution was saved
      queryClient.invalidateQueries({
        queryKey: ["recent-submissions-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recent-submissions-paginated"],
      });
      
      // Invalidate the problem-specific submission history
      queryClient.invalidateQueries({
        queryKey: ["user-submissions", `${trackSlug}:${exerciseSlug}`],
      });

      // If the exercise passed, invalidate the solved exercises query to refresh the UI
      if (data.passed) {
        queryClient.invalidateQueries({
          queryKey: ["academy-solved-exercises", trackSlug],
        });
        queryClient.invalidateQueries({
          queryKey: ["academy-solved-exercises", "all"],
        });
      }
    },
  });
}
