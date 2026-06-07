import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceService } from "@/services/workspace.service";
import { workspaceKeys } from "../queries/use-workspace.queries";
import { toast } from "sonner";
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  CreateDiagramInput,
  UpdateDiagramInput,
} from "@/types/workspace";

/**
 * Hook to create a new workspace.
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceInput) => WorkspaceService.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create workspace");
    },
  });
}

/**
 * Hook to rename/update a workspace.
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceInput }) =>
      WorkspaceService.updateWorkspace(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workspaceShapeDetailQueryKey(data.id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rename workspace");
    },
  });
}

// Helper function to avoid typescript unused or manual namespace keys
function workspaceShapeDetailQueryKey(id: string) {
  return workspaceKeys.detail(id);
}

/**
 * Hook to delete a workspace.
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => WorkspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete workspace");
    },
  });
}

/**
 * Hook to create a new diagram inside a workspace folder.
 */
export function useCreateDiagram(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiagramInput) => WorkspaceService.createDiagram(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.diagrams(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create diagram");
    },
  });
}

/**
 * Hook to auto-save or rename a diagram.
 */
export function useUpdateDiagram(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiagramInput }) =>
      WorkspaceService.updateDiagram(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.diagramDetail(data.id) });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.diagrams(workspaceId) });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save diagram");
    },
  });
}

/**
 * Hook to delete a diagram canvas.
 */
export function useDeleteDiagram(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => WorkspaceService.deleteDiagram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.diagrams(workspaceId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete diagram");
    },
  });
}

/**
 * Hook to clone a diagram canvas to default workspace.
 */
export function useCloneDiagram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => WorkspaceService.cloneDiagram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      toast.success("Diagram cloned successfully to your Personal Workspace!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clone diagram");
    },
  });
}
