import { useQuery } from "@tanstack/react-query";
import { arenaAdminService } from "@/services/arena.service";

export const useArenaStats = () => {
  const statsQuery = useQuery({
    queryKey: ["admin-arena-stats"],
    queryFn: async () => {
      return await arenaAdminService.getStats();
    },
  });

  const data = statsQuery.data;

  return {
    stats: {
      totalMatches: data?.totalMatches || 0,
      totalSubmissions: data?.totalSubmissions || 0,
      languages: data?.languages || {},
      problems: data?.problems || {},
    },
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};
