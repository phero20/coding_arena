import { apiClient } from "@/lib/api-client";

export const taxonomyAdminService = {
  getTree: async () => {
    const { data } = await apiClient.get("/admin/taxonomy/tree");
    return data;
  },
  
  // Category Problems
  getCategoryProblems: async (id: string) => {
    const { data } = await apiClient.get(`/admin/taxonomy/${id}/problems`);
    return data;
  },

  // Categories
  createCategory: async (payload: any) => {
    const { data } = await apiClient.post("/admin/taxonomy/categories", payload);
    return data;
  },

  updateCategory: async (id: string, payload: any) => {
    const { data } = await apiClient.put(`/admin/taxonomy/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string) => {
    const { data } = await apiClient.delete(`/admin/taxonomy/categories/${id}`);
    return data;
  },

  // Problem Mapping
  mapProblem: async (payload: { categoryId: string, problemId: string, order?: number }) => {
    const { data } = await apiClient.post("/admin/taxonomy/map", payload);
    return data;
  },

  batchMapProblems: async (payload: { categoryId: string, mappings: any[] }) => {
    const { data } = await apiClient.post("/admin/taxonomy/map/batch", payload);
    return data;
  },

  unmapProblem: async (categoryId: string, problemId: string) => {
    const { data } = await apiClient.delete(`/admin/taxonomy/map/${categoryId}/${problemId}`);
    return data;
  }
};
