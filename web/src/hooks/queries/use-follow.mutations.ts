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
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["following", currentUsername] });
      await queryClient.cancelQueries({ queryKey: ["followers", targetUsername] });

      // Snapshot the previous value
      const previousFollowing = queryClient.getQueryData(["following", currentUsername]);
      const previousFollowers = queryClient.getQueryData(["followers", targetUsername]);

      // Optimistically update the "following" list of the current user
      if (currentUsername) {
        queryClient.setQueryData(["following", currentUsername], (old: any[] | undefined) => {
          if (!old) return old;
          // Add target user to the list (minimal data needed for UI)
          return [...old, { username: targetUsername, id: `temp-${Date.now()}` }];
        });
      }

      // Optimistically update the "followers" list of the target user
      queryClient.setQueryData(["followers", targetUsername], (old: any[] | undefined) => {
        if (!old) return old;
        return [...old, { username: currentUsername, id: `temp-me-${Date.now()}` }];
      });

      return { previousFollowing, previousFollowers };
    },
    onSuccess: () => {
      toast.success(`You are now following @${targetUsername}`);
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(["following", currentUsername], context.previousFollowing);
        queryClient.setQueryData(["followers", targetUsername], context.previousFollowers);
      }
      toast.error("Failed to follow user. Are you logged in?");
    },
    onSettled: () => {
      // Always refetch to stay in sync with server
      queryClient.invalidateQueries({ queryKey: ["stats", "profile", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["following", targetUsername] });
      if (currentUsername) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUsername] });
        queryClient.invalidateQueries({ queryKey: ["stats", "profile", currentUsername] });
      }
    },
  });

  const unfollow = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/follows/${targetUsername}`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["following", currentUsername] });
      await queryClient.cancelQueries({ queryKey: ["followers", targetUsername] });

      const previousFollowing = queryClient.getQueryData(["following", currentUsername]);
      const previousFollowers = queryClient.getQueryData(["followers", targetUsername]);

      // Optimistically remove from "following" list
      if (currentUsername) {
        queryClient.setQueryData(["following", currentUsername], (old: any[] | undefined) => {
          return old?.filter(u => u.username !== targetUsername);
        });
      }

      // Optimistically remove from "followers" list
      queryClient.setQueryData(["followers", targetUsername], (old: any[] | undefined) => {
        return old?.filter(u => u.username !== currentUsername);
      });

      return { previousFollowing, previousFollowers };
    },
    onSuccess: () => {
      toast.success(`You unfollowed @${targetUsername}`);
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(["following", currentUsername], context.previousFollowing);
        queryClient.setQueryData(["followers", targetUsername], context.previousFollowers);
      }
      toast.error("Failed to unfollow user.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["stats", "profile", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["followers", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["following", targetUsername] });
      if (currentUsername) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUsername] });
        queryClient.invalidateQueries({ queryKey: ["stats", "profile", currentUsername] });
      }
    },
  });

  return { follow, unfollow };
}
