import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  Workspace,
  Diagram,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  CreateDiagramInput,
  UpdateDiagramInput,
} from "@/types/workspace";

/**
 * WorkspaceService
 * Encapsulates all workspace and diagram API request operations.
 * Isolates the hooks from direct HTTP library client calls.
 */
export class WorkspaceService {
  // --- Workspace REST Operations ---

  static async getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<ApiResponse<Workspace[]>>("/workspaces");

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch workspaces");
    }

    return response.data.data;
  }

  static async getWorkspaceById(id: string): Promise<Workspace> {
    const response = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch workspace");
    }

    return response.data.data;
  }

  static async createWorkspace(data: CreateWorkspaceInput): Promise<Workspace> {
    const response = await apiClient.post<ApiResponse<Workspace>>("/workspaces", data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create workspace");
    }

    return response.data.data;
  }

  static async updateWorkspace(id: string, data: UpdateWorkspaceInput): Promise<Workspace> {
    const response = await apiClient.patch<ApiResponse<Workspace>>(`/workspaces/${id}`, data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to update workspace");
    }

    return response.data.data;
  }

  static async deleteWorkspace(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/workspaces/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete workspace");
    }

    return true;
  }

  // --- Diagram REST Operations ---

  static async getDiagramsForWorkspace(workspaceId: string): Promise<Diagram[]> {
    const response = await apiClient.get<ApiResponse<Diagram[]>>(
      `/workspaces/${workspaceId}/diagrams`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch diagrams for workspace");
    }

    return response.data.data;
  }

  static async getDiagramById(id: string): Promise<Diagram> {
    const response = await apiClient.get<ApiResponse<Diagram>>(`/diagrams/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch diagram");
    }

    return response.data.data;
  }

  static async createDiagram(workspaceId: string, data: CreateDiagramInput): Promise<Diagram> {
    const response = await apiClient.post<ApiResponse<Diagram>>(
      `/workspaces/${workspaceId}/diagrams`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create diagram");
    }

    return response.data.data;
  }

  static async updateDiagram(id: string, data: UpdateDiagramInput): Promise<Diagram> {
    const response = await apiClient.patch<ApiResponse<Diagram>>(`/diagrams/${id}`, data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to update diagram");
    }

    return response.data.data;
  }

  static async deleteDiagram(id: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/diagrams/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete diagram");
    }

    return true;
  }

  static async cloneDiagram(id: string): Promise<Diagram> {
    const response = await apiClient.post<ApiResponse<Diagram>>(`/diagrams/${id}/clone`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to clone diagram");
    }

    return response.data.data;
  }
}
