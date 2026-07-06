import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cacheService } from "@/services/cache.service";
import { toast } from "sonner";
import { GetCacheKeysParams } from "@/types/cache";

export const useCacheAdmin = () => {
  const queryClient = useQueryClient();

  const useGetCacheKeys = (params: GetCacheKeysParams) => {
    return useQuery({
      queryKey: ["cache", "keys", params],
      queryFn: () => cacheService.getCacheKeys(params),
    });
  };

  const useGetKeyDetails = (key: string) => {
    return useQuery({
      queryKey: ["cache", "details", key],
      queryFn: () => cacheService.getKeyDetails(key),
      enabled: !!key,
    });
  };

  const useDeleteKey = () => {
    return useMutation({
      mutationFn: cacheService.deleteKey,
      onSuccess: () => {
        toast.success("Cache key deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["cache", "keys"] });
        queryClient.invalidateQueries({ queryKey: ["cache", "details"] });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error || "Failed to delete cache key"
        );
      },
    });
  };

  const useFlushCache = () => {
    return useMutation({
      mutationFn: cacheService.flushCache,
      onSuccess: () => {
        toast.success("Cache flushed successfully");
        queryClient.invalidateQueries({ queryKey: ["cache"] });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error || "Failed to flush cache");
      },
    });
  };

  const useSyncLeaderboard = () => {
    return useMutation({
      mutationFn: cacheService.syncLeaderboard,
      onSuccess: () => {
        toast.success("Leaderboard synchronized successfully");
        queryClient.invalidateQueries({ queryKey: ["cache"] });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error || "Failed to synchronize leaderboard"
        );
      },
    });
  };

  const useSyncContests = () => {
    return useMutation({
      mutationFn: cacheService.syncContests,
      onSuccess: () => {
        toast.success("Contests synchronized successfully");
        queryClient.invalidateQueries({ queryKey: ["cache"] });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error || "Failed to synchronize contests"
        );
      },
    });
  };

  return {
    useGetCacheKeys,
    useGetKeyDetails,
    useDeleteKey,
    useFlushCache,
    useSyncLeaderboard,
    useSyncContests,
  };
};
