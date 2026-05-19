import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useFollowingQuery } from './use-follow.queries';

/**
 * useSocialRegistry: Unified source of truth for the current user's social relationships.
 * Leverages TanStack Query cache to provide instant, O(1) relationship checks.
 */
export function useSocialRegistry() {
  const { user } = useUser();
  const { data: following, isLoading } = useFollowingQuery(user?.username || "");

  const followingSet = useMemo(() => {
    return new Set(following?.map(u => u.username) || []);
  }, [following]);

  const isFollowing = (targetUsername: string): boolean => {
    if (!user || user.username === targetUsername) return false;
    return followingSet.has(targetUsername);
  };

  return {
    isLoading,
    isFollowing,
    followingCount: following?.length || 0,
    followingList: following || [],
    currentUser: user
  };
}
