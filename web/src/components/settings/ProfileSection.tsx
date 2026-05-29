"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useProfileStatsQuery } from "@/hooks/queries/use-stats.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ProfileSettingsTab } from "@/components/profile/ProfileSettingsTab";
import { ProfileSettingsSkeleton } from "@/components/skeletons/ProfileSkeletons";

export const ProfileSection = () => {
  const { user } = useUser();
  const username = user?.username || "";

  const { data, isLoading, isFetching, error, refetch } = useProfileStatsQuery(username);

  return (
    <QueryGuard
      loading={isLoading || isFetching || !username}
      error={error}
      data={data}
      onRetry={refetch}
      skeleton={<ProfileSettingsSkeleton />}
    >
      {(profileData) => (
        <ProfileSettingsTab
          currentUsername={profileData.user.username}
          githubUsername={profileData.user.githubUsername}
          linkedinUsername={profileData.user.linkedinUsername}
          leetcodeUsername={profileData.user.leetcodeUsername}
          value="profile"
        />
      )}
    </QueryGuard>
  );
};
