import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionService } from "@/services/submission.service";

interface UseSubmitCodeArgs {
  problemId: string;
  languageId: string;
}

export const useSubmitCode = ({ problemId, languageId }: UseSubmitCodeArgs) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["submit-code", problemId, languageId],
    mutationFn: (sourceCode: string) =>
      submissionService.submitCode({
        problem_id: problemId,
        language_id: languageId,
        source_code: sourceCode,
      }),
    onSuccess: () => {
      // Refresh submission history for this problem
      queryClient.invalidateQueries({ queryKey: ["submissions", problemId] });
    },
  });

  return {
    submit: (sourceCode: string) => {
      if (mutation.isPending) return;
      mutation.mutate(sourceCode);
    },
    submitAsync: async (sourceCode: string) => {
      if (mutation.isPending) return;
      return mutation.mutateAsync(sourceCode);
    },
    data: mutation.data,
    isSubmitting: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
};
