import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { type ApiResponse } from '@/types/api';

export interface SocialUser {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/**
 * Hook to check if the current logged-in user follows a specific user.
 * @param targetUsername The username of the user to check.
 */
export function useIsFollowingQuery(targetUsername: string) {
  return useQuery({
    queryKey: ['is-following', targetUsername],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<boolean>>(`/follows/is-following/${targetUsername}`);
      return response.data.data;
    },
    enabled: !!targetUsername,
  });
}

/**
 * Hook to fetch the list of followers for a generic user.
 */
export function useFollowersQuery(username: string) {
  return useQuery({
    queryKey: ['followers', username],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SocialUser[]>>(`/follows/${username}/followers`);
      return response.data.data || [];
    },
    enabled: !!username,
  });
}

/**
 * Hook to fetch the list of users a user is following.
 */
export function useFollowingQuery(username: string) {
  return useQuery({
    queryKey: ['following', username],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SocialUser[]>>(`/follows/${username}/following`);
      return response.data.data || [];
    },
    enabled: !!username,
  });
}
