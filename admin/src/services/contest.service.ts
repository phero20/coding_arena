import { apiClient } from "@/lib/api-client";

export interface Contest {
  id: string;
  clistId: number;
  title: string;
  description: string | null;
  platform: string;
  startTime: string;
  endTime: string;
  duration: number;
  href: string;
  resourceId: number | null;
  icon: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const contestAdminService = {
  getAllContests: async (): Promise<Contest[]> => {
    const { data } = await apiClient.get("/admin/contests");
    return data.data || data;
  },

  getStats: async (): Promise<{ contests: number }> => {
    const { data } = await apiClient.get("/admin/contests/stats");
    return data?.data || data || { contests: 0 };
  },



  createContest: async (payload: Partial<Contest>): Promise<Contest> => {
    const { data } = await apiClient.post("/admin/contests", payload);
    return data.data || data;
  },

  updateContest: async (id: string, payload: Partial<Contest>): Promise<Contest> => {
    const { data } = await apiClient.put(`/admin/contests/${id}`, payload);
    return data.data || data;
  },

  deleteContest: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/admin/contests/${id}`);
    return data;
  },


};