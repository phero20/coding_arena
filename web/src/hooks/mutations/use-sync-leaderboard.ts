import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Service to trigger a manual leaderboard synchronization.
 */
export async function syncLeaderboard(): Promise<{ message: string; total: number }> {
  const response = await apiClient.post("/stats/leaderboard/sync");
  return response.data;
}

/**
 * Hook to trigger a leaderboard sync and invalidate existing queries.
 */
export function useSyncLeaderboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncLeaderboard,
    onSuccess: () => {
      // Refresh the leaderboard list after a sync
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
