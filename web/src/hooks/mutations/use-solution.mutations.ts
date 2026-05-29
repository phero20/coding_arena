import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSolution, voteSolution, updateSolution, deleteSolution } from "@/services/mutations/solution.mutations";
import { solutionKeys } from "../queries/use-solution.queries";
import { toast } from "sonner";

/**
 * Hook to create a new solution.
 */
export function useCreateSolution(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createSolution>[1]) => createSolution(problemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solutionKeys.all });
      toast.success("Solution submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit solution");
    },
  });
}

/**
 * Hook to vote on a solution.
 */
export function useVoteSolution(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ solutionId, voteType }: { solutionId: string; voteType: 1 | -1 }) => 
      voteSolution(solutionId, voteType),
    onSuccess: () => {
      // Refetch the solutions list to show updated counts
      queryClient.invalidateQueries({ queryKey: solutionKeys.problem(problemId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cast vote");
    },
  });
}

/**
 * Hook to update a solution.
 */
export function useUpdateSolution(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ solutionId, data }: { solutionId: string; data: Partial<Parameters<typeof updateSolution>[1]> }) => 
      updateSolution(solutionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solutionKeys.all });
      toast.success("Solution updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update solution");
    },
  });
}

/**
 * Hook to delete a solution.
 */
export function useDeleteSolution(problemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solutionId: string) => deleteSolution(solutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: solutionKeys.all });
      toast.success("Solution deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete solution");
    },
  });
}
