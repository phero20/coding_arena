import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemDesignAdminService, type SystemDesignTopic } from "@/services/system-design.service";
import { toast } from "sonner";

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
