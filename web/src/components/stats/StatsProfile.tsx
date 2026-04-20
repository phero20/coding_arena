"use client";

import { SolveBreakdown } from "./SolveBreakdown";
import { GritGraph } from "./GritGraph";
import { BadgeShowcase } from "./BadgeShowcase";
import { RecentActivities } from "./RecentActivities";
import { type UserProfileData } from "@/types/stats";

interface StatsProfileProps {
  data: UserProfileData;
}

/**
 * StatsProfile: The Master Orchestrator.
 * Mirrors the dense, multi-row LeetCode dashboard exactly.
 */
export function StatsProfile({ data }: StatsProfileProps) {
  const { stats, activityLog } = data;

  return (
    <div className="space-y-3">
      {/* Row 1: The Command Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-6">
          <SolveBreakdown stats={stats} />
        </div>
        <div className="xl:col-span-6">
          <BadgeShowcase stats={stats} />
        </div>
      </div>

      {/* Row 2: The Activity Grid */}
      <div className="w-full">
        <GritGraph
          activityLog={activityLog}
          stats={stats}
          joinedAt={data.user.joinedAt}
        />
      </div>

      {/* Row 3: The Tactical Log */}
      <div className="w-full">
        <RecentActivities username={data.user.username} />
      </div>
    </div>
  );
}
