"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useProfileStatsQuery } from "@/hooks/queries/use-stats.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ProfileSettingsTab } from "@/components/profile/ProfileSettingsTab";
import { IdentitySkeleton, ActivitySkeleton } from "@/components/shared/Skeletons";

export const ProfileSection = () => {
  const { user } = useUser();
  const username = user?.username || "";

  const { data, isLoading, error, refetch } = useProfileStatsQuery(username);

  return (
    <QueryGuard
      loading={isLoading || !username}
      error={error}
      data={data}
      onRetry={refetch}
      skeleton={
        <div className="space-y-6">
          <IdentitySkeleton />
          <ActivitySkeleton />
        </div>
      }
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
