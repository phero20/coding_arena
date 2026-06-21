import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taxonomyAdminService } from "@/services/taxonomy.service";
import { toast } from "sonner";

export const useTaxonomyStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-taxonomy-stats"],
    queryFn: async () => {
      return await taxonomyAdminService.getStats();
    },
  });

  return {
    stats: statsQuery.data || {
      categories: 0,
      traffic: [],
    },
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export const useTaxonomyTree = () => {
  const queryClient = useQueryClient();

  const treeQuery = useQuery({
    queryKey: ["admin-taxonomy-tree"],
    queryFn: async () => {
      return await taxonomyAdminService.getTree();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: any) => taxonomyAdminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-taxonomy-tree"] });
      toast.success("Category created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create category",
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      taxonomyAdminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-taxonomy-tree"] });
      toast.success("Category updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update category",
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => taxonomyAdminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-taxonomy-tree"] });
      toast.success("Category deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete category",
      );
    },
  });

  let treeList = [];
  if (Array.isArray(treeQuery.data)) {
    treeList = treeQuery.data;
  } else if (treeQuery.data?.data && Array.isArray(treeQuery.data.data)) {
    treeList = treeQuery.data.data;
  }

  return {
    tree: treeList,
    isLoading: treeQuery.isLoading,
    isError: treeQuery.isError,
    error: treeQuery.error,

    createCategory: createCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,

    updateCategory: updateCategoryMutation.mutateAsync,
    isUpdating: updateCategoryMutation.isPending,

    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeleting: deleteCategoryMutation.isPending,
  };
};

export const useTaxonomyCategoryDetail = (category: any) => {
  const queryClient = useQueryClient();
  const id = category?.id;

  const isLeafNode = !category?.children || category.children.length === 0;

  const detailQuery = useQuery({
    queryKey: ["admin-taxonomy-problems", id],
    queryFn: async () => {
      if (!id || !isLeafNode) return null;
      return await taxonomyAdminService.getCategoryProblems(id);
    },
    enabled: !!id && isLeafNode,
  });

  const mapProblemMutation = useMutation({
    mutationFn: (payload: {
      categoryId: string;
      problemId: string;
      order?: number;
    }) => taxonomyAdminService.mapProblem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-taxonomy-problems", id],
      });
      toast.success("Problem mapped successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to map problem",
      );
    },
  });

  const batchMapProblemsMutation = useMutation({
    mutationFn: (payload: { categoryId: string; mappings: any[] }) =>
      taxonomyAdminService.batchMapProblems(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-taxonomy-problems", id],
      });
      toast.success("Problems mapped successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to map problems",
      );
    },
  });

  const unmapProblemMutation = useMutation({
    mutationFn: ({
      categoryId,
      problemId,
    }: {
      categoryId: string;
      problemId: string;
    }) => taxonomyAdminService.unmapProblem(categoryId, problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-taxonomy-problems", id],
      });
      toast.success("Problem unmapped successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to unmap problem",
      );
    },
  });

  return {
    problems: detailQuery.data?.data || detailQuery.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,

    mapProblem: mapProblemMutation.mutateAsync,
    isMapping: mapProblemMutation.isPending,

    batchMapProblems: batchMapProblemsMutation.mutateAsync,
    isBatchMapping: batchMapProblemsMutation.isPending,

    unmapProblem: unmapProblemMutation.mutateAsync,
    isUnmapping: unmapProblemMutation.isPending,
  };
};
