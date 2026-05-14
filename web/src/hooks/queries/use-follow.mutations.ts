import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

/**
 * Mutation hook for following/unfollowing users.
 * Automatically invalidates profile queries to refresh counts.
 */
export function useFollowMutation(targetUsername: string, currentUsername?: string) {
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/follows/${targetUsername}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the target's stats to update their follower count
      queryClient.invalidateQueries({ queryKey: ["stats", "profile", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["following", targetUsername] });
      
      // CRITICAL: Invalidate the CURRENT user's following list and stats so the UI updates instantly
      if (currentUsername) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUsername] });
        queryClient.invalidateQueries({ queryKey: ["stats", "profile", currentUsername] });
      }

      toast.success(`You are now following @${targetUsername}`);
    },
    onError: () => {
      toast.error("Failed to follow warrior. Are you logged in?");
    },
  });

  const unfollow = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/follows/${targetUsername}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the target's stats to update their follower count
      queryClient.invalidateQueries({ queryKey: ["stats", "profile", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["following", targetUsername] });
      
      // CRITICAL: Invalidate the CURRENT user's following list and stats so the UI updates instantly
      if (currentUsername) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUsername] });
        queryClient.invalidateQueries({ queryKey: ["stats", "profile", currentUsername] });
      }

      toast.success(`You unfollowed @${targetUsername}`);
    },
    onError: () => {
      toast.error("Failed to unfollow warrior.");
    },
  });

  return { follow, unfollow };
}
