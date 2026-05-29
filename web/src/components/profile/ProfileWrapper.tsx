"use client";

import { useProfileStatsQuery } from "@/hooks/queries/use-stats.queries";
import { ProfileLayout } from "./ProfileLayout";
import { StatsProfile } from "../stats/StatsProfile";
<<<<<<< HEAD
import { 
  IdentitySkeleton, 
  StatsSkeleton, 
  ActivitySkeleton,
  RecentActivitiesSkeleton
=======
import {
  IdentitySkeleton,
  StatsSkeleton,
  ConnectLeetCodeSkeleton,
  ActivitySkeleton,
  RecentActivitiesSkeleton,
>>>>>>> prod-deploy
} from "@/components/shared/Skeletons";

import { QueryGuard } from "@/components/shared/QueryGuard";

interface ProfileWrapperProps {
  username: string;
}

/**
<<<<<<< HEAD
 * ProfileWrapper is a Client Component that handles the data fetching 
 * for the profile page and orchestrates the layout.
 */
export function ProfileWrapper({ username }: ProfileWrapperProps) {
  const { data, isLoading, error, refetch } = useProfileStatsQuery(username);
  
  return (
    <QueryGuard
      loading={isLoading}
=======
 * ProfileWrapper is a Client Component that handles the data fetching
 * for the profile page and orchestrates the layout.
 */
export function ProfileWrapper({ username }: ProfileWrapperProps) {
  const { data, isLoading, isFetching, error, refetch } = useProfileStatsQuery(username);

  return (
    <QueryGuard
      loading={isLoading || isFetching}
>>>>>>> prod-deploy
      error={error}
      data={data}
      onRetry={refetch}
      skeleton={
        <div className="flex flex-col lg:flex-row gap-8">
          <IdentitySkeleton />
          <div className="flex-1 space-y-8">
<<<<<<< HEAD
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <StatsSkeleton />
              <StatsSkeleton />
=======
            <div className="space-y-3">
              <ConnectLeetCodeSkeleton />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <StatsSkeleton />
                <StatsSkeleton />
              </div>
>>>>>>> prod-deploy
            </div>
            <ActivitySkeleton />
            <RecentActivitiesSkeleton />
          </div>
        </div>
      }
      errorTitle="User Registry Error"
      errorMessage="The stats for this user have been lost to the sands of time."
    >
      {(profileData) => (
<<<<<<< HEAD
        <ProfileLayout 
          username={profileData.user.username} 
=======
        <ProfileLayout
          username={profileData.user.username}
>>>>>>> prod-deploy
          fullName={profileData.user.fullName || undefined}
          avatarUrl={profileData.user.avatarUrl || undefined}
          githubUsername={profileData.user.githubUsername}
          linkedinUsername={profileData.user.linkedinUsername}
          leetcodeUsername={profileData.user.leetcodeUsername}
          joinedAt={profileData.user.joinedAt}
          followerCount={profileData.social.followers}
          followingCount={profileData.social.following}
          clerkUserId={profileData.user.clerkId}
          stats={profileData.stats}
        >
          <StatsProfile data={profileData} />
        </ProfileLayout>
      )}
    </QueryGuard>
  );
}
