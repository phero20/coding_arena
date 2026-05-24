import { useQuery } from "@tanstack/react-query";
import { WorkspaceService } from "@/services/workspace.service";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
  detail: (id: string) => [...workspaceKeys.all, "detail", id] as const,
  diagrams: (workspaceId: string) => [...workspaceKeys.all, "diagrams", workspaceId] as const,
  diagramDetail: (id: string) => [...workspaceKeys.all, "diagram", id] as const,
};

/**
 * Hook to fetch all workspaces for the logged-in user.
 */
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: () => WorkspaceService.getWorkspaces(),
  });
}

/**
 * Hook to fetch details for a specific workspace.
 */
export function useWorkspace(id: string) {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => WorkspaceService.getWorkspaceById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch all diagrams inside a workspace.
 */
export function useWorkspaceDiagrams(workspaceId: string) {
  return useQuery({
    queryKey: workspaceKeys.diagrams(workspaceId),
    queryFn: () => WorkspaceService.getDiagramsForWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Hook to fetch a specific diagram's canvas details (and state).
 */
export function useDiagram(id: string) {
  return useQuery({
    queryKey: workspaceKeys.diagramDetail(id),
    queryFn: () => WorkspaceService.getDiagramById(id),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });
}
