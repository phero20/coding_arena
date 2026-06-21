import { apiClient } from "@/lib/api-client";

export interface SystemDesignTopic {
  id: string;
  topic_id: string;
  slug: string;
  title: string;
  order: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const systemDesignAdminService = {
  getStats: async (): Promise<{ topics: number; workspaces: number; diagrams: number }> => {
    const { data } = await apiClient.get("/admin/system-design/stats");
    return data?.data || { topics: 0, workspaces: 0, diagrams: 0 };
  },

  getUserWorkspaces: async (userId: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/admin/system-design/workspaces/user/${userId}`);
    return data?.data || data || [];
  },

  getUserDiagrams: async (userId: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/admin/system-design/diagrams/user/${userId}`);
    return data?.data || data || [];
  },

  deleteWorkspace: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/system-design/workspaces/${id}`);
  },

  deleteDiagram: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/system-design/diagrams/${id}`);
  },

  getAllTopics: async (): Promise<SystemDesignTopic[]> => {
    const { data } = await apiClient.get("/admin/system-design");
    // Hono sometimes wraps array responses in data.data or returns it directly based on the route wrapper
    // We'll return data.data if it exists, otherwise data
    return data.data || data;
  },

  createTopic: async (payload: Partial<SystemDesignTopic>): Promise<SystemDesignTopic> => {
    const { data } = await apiClient.post("/admin/system-design", payload);
    return data.data || data;
  },

  updateTopic: async (id: string, payload: Partial<SystemDesignTopic>): Promise<SystemDesignTopic> => {
    const { data } = await apiClient.put(`/admin/system-design/${id}`, payload);
    return data.data || data;
  },

  deleteTopic: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/system-design/${id}`);
    return data;
  },

  bulkReorderTopics: async (mappings: Array<{ id: string; order: number }>): Promise<void> => {
    const { data } = await apiClient.post("/admin/system-design/reorder", { mappings });
    return data;
  }
};
