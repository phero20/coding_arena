"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { type UserStats } from "@/types/stats";
import { SocialTab } from "./SocialTab";
import { ProfileSidebar } from "./ProfileSidebar";
import { ArenaHistoryTab } from "./ArenaHistoryTab";
import { useProfileStore } from "@/store/use-profile-store";

interface ProfileLayoutProps {
  username: string;
  fullName?: string;
  avatarUrl?: string;
  githubUsername?: string | null;
  linkedinUsername?: string | null;
  leetcodeUsername?: string | null;
  joinedAt: string;
  followerCount: number;
  followingCount: number;
  clerkUserId: string;
  stats?: UserStats;
  children: React.ReactNode;
}

export function ProfileLayout({
  username,
  fullName,
  avatarUrl,
  githubUsername,
  linkedinUsername,
  leetcodeUsername,
  joinedAt,
  followerCount,
  followingCount,
  clerkUserId,
  stats,
  children,
}: ProfileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { user } = useUser();
  const { activeTab, initTab, syncTab } = useProfileStore();

  // Smart state management: Initial load and username changes
  React.useEffect(() => {
    initTab({ tabParam, router, pathname, searchParams, username });
  }, [username, tabParam, initTab, router, pathname, searchParams]);

  const isOwner = user?.username === username;

  const handleTabChange = (value: string) => {
    syncTab({ value, router, pathname, searchParams });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="flex flex-col lg:flex-row gap-10"
    >
      {/* Tactical Sidebar */}
      <ProfileSidebar
        username={username}
        fullName={fullName}
        avatarUrl={avatarUrl}
        githubUsername={githubUsername}
        linkedinUsername={linkedinUsername}
        leetcodeUsername={leetcodeUsername}
        followerCount={followerCount}
        followingCount={followingCount}
        isOwner={isOwner}
        stats={stats}
      />

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <TabsContent value="stats" className="mt-0 focus-visible:ring-0">
          {children}
        </TabsContent>

        <TabsContent value="social" className="mt-0 focus-visible:ring-0">
          <SocialTab username={username} />
        </TabsContent>

        <TabsContent value="arena" className="mt-0 focus-visible:ring-0">
          <ArenaHistoryTab userId={clerkUserId} />
        </TabsContent>
      </main>
    </Tabs>
  );
}
