import { apiClient } from "@/lib/api-client";
import {
  GetCacheKeysParams,
  GetCacheKeysResponse,
  CacheKeyDetails,
} from "../types/cache";

export const cacheService = {
  getCacheKeys: async (
    params: GetCacheKeysParams
  ): Promise<GetCacheKeysResponse> => {
    const { data } = await apiClient.get("/admin/system/cache", { params });
    return data.data || data;
  },

  getKeyDetails: async (key: string): Promise<CacheKeyDetails> => {
    const { data } = await apiClient.get(
      `/admin/system/cache/${encodeURIComponent(key)}`
    );
    return data.data || data;
  },

  deleteKey: async (key: string): Promise<void> => {
    await apiClient.delete(`/admin/system/cache/${encodeURIComponent(key)}`);
  },

  flushCache: async (): Promise<void> => {
    await apiClient.delete("/admin/system/cache/flush");
  },

  syncLeaderboard: async (): Promise<void> => {
    await apiClient.post("/stats/leaderboard/sync");
  },

  syncContests: async (): Promise<void> => {
    await apiClient.post("/admin/contests/sync");
  },
};
