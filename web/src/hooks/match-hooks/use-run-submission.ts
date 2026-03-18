import { useMutation } from "@tanstack/react-query";
import { submissionService } from "@/services/submission.service";

interface UseRunSubmissionArgs {
  problemId: string;
  languageId: string;
}

export const useRunSubmission = ({ problemId, languageId }: UseRunSubmissionArgs) => {
  const mutation = useMutation({
    mutationKey: ["run-submission", problemId, languageId],
    mutationFn: (sourceCode: string) =>
      submissionService.runSubmission({
        problem_id: problemId,
        language_id: languageId,
        source_code: sourceCode,
      }),
  });

  return {
    run: mutation.mutate,
    runAsync: mutation.mutateAsync,
    data: mutation.data,
    isRunning: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
};

