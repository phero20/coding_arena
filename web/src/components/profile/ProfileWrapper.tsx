"use client";

import { useProfileStatsQuery } from "@/hooks/queries/use-stats.queries";
import { ProfileLayout } from "./ProfileLayout";
import { StatsProfile } from "../stats/StatsProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileWrapperProps {
  username: string;
}

/**
 * ProfileWrapper is a Client Component that handles the data fetching 
 * for the profile page and orchestrates the layout.
 */
export function ProfileWrapper({ username }: ProfileWrapperProps) {
  const { data, isLoading, error } = useProfileStatsQuery(username);
  console.log(data)
  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-72 shrink-0 space-y-8">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="flex-1 space-y-8">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Warrior Not Found</h2>
        <p className="text-muted-foreground">The stats for this warrior have been lost to the sands of time.</p>
      </div>
    );
  }

  return (
    <ProfileLayout 
      username={data.user.username} 
      fullName={data.user.fullName || undefined}
      avatarUrl={data.user.avatarUrl || undefined}
      githubUsername={data.user.githubUsername}
      linkedinUsername={data.user.linkedinUsername}
      leetcodeUsername={data.user.leetcodeUsername}
      joinedAt={data.user.joinedAt}
      followerCount={data.social.followers}
      followingCount={data.social.following}
      isFollowing={data.social.isFollowing}
      stats={data.stats}
    >
      <StatsProfile data={data} />
    </ProfileLayout>
  );
}
