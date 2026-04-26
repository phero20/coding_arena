"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { User, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { type UserStats } from "@/types/stats";
import { SocialTab } from "./SocialTab";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileSettingsTab } from "./ProfileSettingsTab";
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
  const { user } = useUser();
  const { activeTab, setActiveTab, socialType, setSocialType, reset } = useProfileStore();

  // Reset store on mount or username change to ensure fresh UI state
  React.useEffect(() => {
    reset();
    return () => reset();
  }, [username, reset]);

  const isOwner = user?.username === username;

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
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

        <TabsContent value="profile" className="mt-0">
          <div className="p-12 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
            <User size={40} className="mb-4 text-muted-foreground/30" />
            <h3 className="text-sm font-semibold uppercase">
              Public profile settings under construct
            </h3>
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-0 focus-visible:ring-0">
          <SocialTab
            username={username}
          />
        </TabsContent>

        <TabsContent value="arena" className="mt-0 focus-visible:ring-0">
          <ArenaHistoryTab userId={clerkUserId} />
        </TabsContent>

        {isOwner && (
          <ProfileSettingsTab
            currentUsername={username}
            githubUsername={githubUsername}
            linkedinUsername={linkedinUsername}
            leetcodeUsername={leetcodeUsername}
          />
        )}
      </main>
    </Tabs>
  );
}
