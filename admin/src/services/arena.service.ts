import { apiClient } from "@/lib/api-client";

export interface ArenaStats {
  totalMatches: number;
  totalSubmissions: number;
  languages: Record<string, number>;
  problems: Record<string, number>;
}

export const arenaAdminService = {
  getStats: async (): Promise<ArenaStats> => {
    const { data } = await apiClient.get("/admin/arena/stats");
    return data?.data || { 
      totalMatches: 0, 
      totalSubmissions: 0,
      languages: {},
      problems: {}
    };
  }
};
