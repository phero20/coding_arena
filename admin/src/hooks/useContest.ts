import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contestAdminService, type Contest } from "@/services/contest.service";
import { toast } from "sonner";

export const useContestStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-contest-stats"],
    queryFn: async () => {
      return await contestAdminService.getStats();
    },
  });

  return {
    stats: statsQuery.data || { contests: 0 },
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export const useContestAdmin = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-contests"],
    queryFn: () => contestAdminService.getAllContests(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Contest>) => contestAdminService.createContest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
      toast.success("Contest created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create contest");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Contest> }) => 
      contestAdminService.updateContest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
      toast.success("Contest updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update contest");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contestAdminService.deleteContest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
      toast.success("Contest deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete contest");
    },
  });



  return {
    contests: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createContest: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateContest: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteContest: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

