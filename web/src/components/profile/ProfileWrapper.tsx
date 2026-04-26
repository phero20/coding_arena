"use client";

import { useProfileStatsQuery } from "@/hooks/queries/use-stats.queries";
import { ProfileLayout } from "./ProfileLayout";
import { StatsProfile } from "../stats/StatsProfile";
import {
  IdentitySkeleton,
  StatsSkeleton,
  ConnectLeetCodeSkeleton,
  ActivitySkeleton,
  RecentActivitiesSkeleton,
} from "@/components/shared/Skeletons";

import { QueryGuard } from "@/components/shared/QueryGuard";

interface ProfileWrapperProps {
  username: string;
}

/**
 * ProfileWrapper is a Client Component that handles the data fetching
 * for the profile page and orchestrates the layout.
 */
export function ProfileWrapper({ username }: ProfileWrapperProps) {
  const { data, isLoading, error, refetch } = useProfileStatsQuery(username);

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={data}
      onRetry={refetch}
      skeleton={
        <div className="flex flex-col lg:flex-row gap-8">
          <IdentitySkeleton />
          <div className="flex-1 space-y-8">
            <div className="space-y-3">
              <ConnectLeetCodeSkeleton />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <StatsSkeleton />
                <StatsSkeleton />
              </div>
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
        <ProfileLayout
          username={profileData.user.username}
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
