"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
<<<<<<< HEAD
import { User, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { type UserStats } from "@/types/stats";
import { SocialTab } from "./SocialTab";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfileSettingsTab } from "./ProfileSettingsTab";
import { ArenaHistoryTab } from "./ArenaHistoryTab";
=======
import { useUser } from "@clerk/nextjs";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { type UserStats } from "@/types/stats";
import { SocialTab } from "./SocialTab";
import { ProfileSidebar } from "./ProfileSidebar";
import { ArenaHistoryTab } from "./ArenaHistoryTab";
import { SolutionsTab } from "./SolutionsTab";
import { useProfileStore } from "@/store/use-profile-store";
import { RecentActivities } from "../stats/RecentActivities";
import { useActivityPagination } from "@/hooks/stats/use-activity-pagination";
import { Code2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
>>>>>>> prod-deploy

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
<<<<<<< HEAD
  const { user } = useUser();
  const [activeTab, setActiveTab] = React.useState("stats");
  const [socialType, setSocialType] = React.useState<"followers" | "following">(
    "followers",
  );

  const isOwner = user?.username === username;

  const handleSocialClick = (type: "followers" | "following") => {
    setSocialType(type);
    setActiveTab("social");
=======
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { user } = useUser();
  const { totalCount } = useActivityPagination(username, 10);
  const { activeTab, initTab, syncTab } = useProfileStore();

  // Smart state management: Initial load and username changes
  React.useEffect(() => {
    initTab({ 
      tabParam, 
      router, 
      pathname, 
      searchParams, 
      username 
    });
  }, [username, tabParam, initTab, router, pathname, searchParams]);

  const isOwner = user?.username === username;

  const handleTabChange = (value: string) => {
    syncTab({ value, router, pathname, searchParams });
>>>>>>> prod-deploy
  };

  return (
    <Tabs
      value={activeTab}
<<<<<<< HEAD
      onValueChange={setActiveTab}
=======
      onValueChange={handleTabChange}
>>>>>>> prod-deploy
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
<<<<<<< HEAD
        onTabChange={setActiveTab}
        onSocialClick={handleSocialClick}
=======
>>>>>>> prod-deploy
      />

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <TabsContent value="stats" className="mt-0 focus-visible:ring-0">
          {children}
        </TabsContent>

<<<<<<< HEAD
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
            key={`${username}-${socialType}`}
            username={username}
            initialType={socialType}
            onBack={() => setActiveTab("stats")}
          />
=======
        <TabsContent value="social" className="mt-0 focus-visible:ring-0">
          <SocialTab username={username} />
>>>>>>> prod-deploy
        </TabsContent>

        <TabsContent value="arena" className="mt-0 focus-visible:ring-0">
          <ArenaHistoryTab userId={clerkUserId} />
        </TabsContent>

<<<<<<< HEAD
        {isOwner && (
          <ProfileSettingsTab
            currentUsername={username}
            githubUsername={githubUsername}
            linkedinUsername={linkedinUsername}
            leetcodeUsername={leetcodeUsername}
          />
        )}
=======
        <TabsContent value="solutions" className="mt-0 focus-visible:ring-0">
          <SolutionsTab userId={clerkUserId} />
        </TabsContent>

        <TabsContent value="submissions" className="mt-0 focus-visible:ring-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  RECENT SUBMISSIONS
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">
                  Full history of code submissions and verdicts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="p-2">
                  {totalCount} TOTAL SUBMISSIONS
                </Badge>
              </div>
            </div>
            
            <RecentActivities
              username={username}
              hideHeader
              className="p-0 border-0 bg-transparent"
            />
          </div>
        </TabsContent>
>>>>>>> prod-deploy
      </main>
    </Tabs>
  );
}
