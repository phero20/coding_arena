import { apiClient } from "@/lib/api-client";

export interface Company {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  problem_ids: string[];
  createdAt: string;
  updatedAt: string;
}

export const companyAdminService = {
  getAllCompanies: async (): Promise<Company[]> => {
    const { data } = await apiClient.get("/admin/company");
    // Hono sometimes wraps array responses in data.data or returns it directly based on the route wrapper
    // We'll return data.data if it exists, otherwise data
    return data.data || data;
  },

  createCompany: async (payload: Partial<Company>): Promise<Company> => {
    const { data } = await apiClient.post("/admin/company", payload);
    return data.data || data;
  },

  updateCompany: async (id: string, payload: Partial<Company>): Promise<Company> => {
    const { data } = await apiClient.put(`/admin/company/${id}`, payload);
    return data.data || data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/company/${id}`);
    return data;
  },
};
