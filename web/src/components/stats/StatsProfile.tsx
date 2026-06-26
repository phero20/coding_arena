"use client";

import { SolveBreakdown } from "./SolveBreakdown";
import { LeetCodeSolveBreakdown } from "./LeetCodeSolveBreakdown";
import { LeetCodeContestCard } from "./LeetCodeContestCard";
import { GritGraph } from "./GritGraph";
import { BadgeShowcase } from "./BadgeShowcase";
import { RecentActivities } from "./RecentActivities";
import { type UserProfileData } from "@/types/stats";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Code2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { useProfileStore } from "@/store/use-profile-store";
import { useUser } from "@clerk/nextjs";

interface StatsProfileProps {
  data: UserProfileData;
}

/**
 * StatsProfile: The Master Orchestrator.
 * Mirrors the dense, multi-row LeetCode dashboard exactly.
 */
export function StatsProfile({ data }: StatsProfileProps) {
  const { stats, activityLog, leetcode, user } = data;
  const { setActiveTab } = useProfileStore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  
  const isOwner = currentUser?.username === user.username;

  return (
    <div className="space-y-3">
      {/* Row 1: External Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {leetcode && user.leetcodeUsername ? (
          <>
            <div className="xl:col-span-6">
              <LeetCodeSolveBreakdown stats={leetcode} username={user.leetcodeUsername} />
            </div>
            <div className="xl:col-span-6">
              <LeetCodeContestCard stats={leetcode} username={user.leetcodeUsername} />
            </div>
          </>
        ) : isOwner ? (
          <div className="xl:col-span-12">
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-3 sm:px-5 gap-4 border-dashed bg-muted/5 group/connect hover:bg-muted/10 transition-all cursor-pointer border-muted-foreground/20">
              <div className="flex items-center gap-4">
                <div className=" shrink-0">
                  <Code2 className="w-5 h-5 text-difficulty-medium" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold tracking-tight">Connect LeetCode</h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    Connect your LeetCode account to fetch and display your solve stats and contest rating.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="default" 
                size="default"
                className="w-full sm:w-auto shrink-0"
                onClick={() => router.push("/settings?tab=profile")}
              >
                Link Account
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Row 2: Native Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-6">
          <SolveBreakdown stats={stats} />
        </div>
        <div className="xl:col-span-6">
          <BadgeShowcase stats={stats} />
        </div>
      </div>

      {/* Row 3: The Activity Grid */}
      <div className="w-full">
        <GritGraph
          activityLog={activityLog}
          stats={stats}
          joinedAt={data.user.joinedAt}
        />
      </div>

      {/* Row 4: The Tactical Log */}
      <div className="w-full">
        <RecentActivities username={data.user.username} redirectOnLoadMore={true} />
      </div>
    </div>
  );
}
