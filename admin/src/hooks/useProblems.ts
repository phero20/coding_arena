import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { problemAdminService, type Problem } from "@/services/problem.service";
import { toast } from "sonner";

export const useProblemStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-problem-stats"],
    queryFn: async () => {
      return await problemAdminService.getStats();
    },
  });

  const data = statsQuery.data;

  return {
    stats: {
      problems: data?.problems || 0,
      testcases: data?.testcases || 0,
      difficulty: data?.difficulty || { easy: 0, medium: 0, hard: 0, total: 0 },
      userSolvedProblems: data?.userSolvedProblems || { easy: 0, medium: 0, hard: 0, total: 0 },
      userSolvedLanguages: data?.userSolvedLanguages || {},
      totalSubmissions: data?.totalSubmissions || 0,
      submissionStatus: data?.submissionStatus || {},
    },
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export const useProblemsAdmin = (page: number, limit: number, search: string) => {
  const query = useQuery({
    queryKey: ["admin-problems", page, limit, search],
    queryFn: () => problemAdminService.getProblems({ page, limit, search }),
    placeholderData: (previousData) => previousData,
  });

  return {
    problems: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

export const useProblemAdmin = (id?: string) => {
  return useQuery({
    queryKey: ["admin-problem", id],
    queryFn: () => (id ? problemAdminService.getProblemById(id) : null),
    enabled: !!id,
  });
};

export const useProblemMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Problem>) => problemAdminService.createProblem(payload),
    onSuccess: () => {
      toast.success("Problem created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-problems"] });
      queryClient.invalidateQueries({ queryKey: ["admin-problem"] });
    },
    onError: (error) => {
      toast.error("Failed to create problem: " + (error as any).message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Problem> }) => 
      problemAdminService.updateProblem(id, payload),
    onSuccess: () => {
      toast.success("Problem updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-problems"] });
      queryClient.invalidateQueries({ queryKey: ["admin-problem"] });
    },
    onError: (error) => {
      toast.error("Failed to update problem: " + (error as any).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => problemAdminService.deleteProblem(id),
    onSuccess: () => {
      toast.success("Problem deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-problems"] });
      queryClient.invalidateQueries({ queryKey: ["admin-problem"] });
    },
    onError: (error) => {
      toast.error("Failed to delete problem: " + (error as any).message);
    },
  });

  return {
    createProblem: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProblem: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProblem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useProblemTestsAdmin = (id?: string) => {
  return useQuery({
    queryKey: ["admin-problem-tests", id],
    queryFn: () => (id ? problemAdminService.getProblemTests(id) : []),
    enabled: !!id,
  });
};

export const useProblemTestMutations = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { type: string; cases: any[] } }) => 
      problemAdminService.updateProblemTests(id, payload),
    onSuccess: (_, variables) => {
      toast.success("Problem tests updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-problem-tests", variables.id] });
    },
    onError: (error) => {
      toast.error("Failed to update problem tests: " + (error as any).message);
    },
  });

  return {
    updateProblemTests: updateMutation.mutateAsync,
    isUpdatingTests: updateMutation.isPending,
  };
};
