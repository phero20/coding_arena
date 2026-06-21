import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemDesignAdminService, type SystemDesignTopic } from "@/services/system-design.service";
import { toast } from "sonner";

export const useSystemDesignStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-system-design-stats"],
    queryFn: async () => {
      return await systemDesignAdminService.getStats();
    },
  });

  return {
    stats: statsQuery.data || { topics: 0, workspaces: 0, diagrams: 0 },
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export const useUserWorkspaces = (userId?: string) => {
  return useQuery({
    queryKey: ["admin-user-workspaces", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await systemDesignAdminService.getUserWorkspaces(userId);
    },
    enabled: !!userId,
  });
};

export const useUserDiagrams = (userId?: string) => {
  return useQuery({
    queryKey: ["admin-user-diagrams", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await systemDesignAdminService.getUserDiagrams(userId);
    },
    enabled: !!userId,
  });
};

export const useSystemDesignAdmin = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-system-design-topics"],
    queryFn: () => systemDesignAdminService.getAllTopics(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<SystemDesignTopic>) => systemDesignAdminService.createTopic(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topic created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create topic");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SystemDesignTopic> }) => 
      systemDesignAdminService.updateTopic(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topic updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update topic");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => systemDesignAdminService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topic deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete topic");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (mappings: Array<{ id: string; order: number }>) => 
      systemDesignAdminService.bulkReorderTopics(mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topics reordered successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to reorder topics");
    },
  });

  return {
    topics: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    createTopic: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateTopic: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteTopic: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    reorderTopics: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
  };
};

export const useSystemDesignMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: Partial<SystemDesignTopic>) => systemDesignAdminService.createTopic(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topic created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to create topic");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SystemDesignTopic> }) => 
      systemDesignAdminService.updateTopic(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topic updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update topic");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => systemDesignAdminService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topic deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to delete topic");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (mappings: Array<{ id: string; order: number }>) => 
      systemDesignAdminService.bulkReorderTopics(mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-design-topics"] });
      toast.success("Topics reordered successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to reorder topics: " + (error as any).message);
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: (id: string) => systemDesignAdminService.deleteWorkspace(id),
    onSuccess: () => {
      toast.success("Workspace deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-user-workspaces"] });
    },
    onError: (error) => {
      toast.error("Failed to delete workspace: " + (error as any).message);
    },
  });

  const deleteDiagramMutation = useMutation({
    mutationFn: (id: string) => systemDesignAdminService.deleteDiagram(id),
    onSuccess: () => {
      toast.success("Diagram deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-user-diagrams"] });
    },
    onError: (error) => {
      toast.error("Failed to delete diagram: " + (error as any).message);
    },
  });

  return {
    createTopic: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTopic: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTopic: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    reorderTopics: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
    deleteWorkspace: deleteWorkspaceMutation.mutateAsync,
    isDeletingWorkspace: deleteWorkspaceMutation.isPending,
    deleteDiagram: deleteDiagramMutation.mutateAsync,
    isDeletingDiagram: deleteDiagramMutation.isPending,
  };
};
