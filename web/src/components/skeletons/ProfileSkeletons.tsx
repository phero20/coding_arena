import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Identity Sidebar Skeleton (Ghost of ProfileSidebar)
 */
export const IdentitySkeleton = () => (
  <SkeletonProvider noWrapper>
    <aside className="lg:w-80 shrink-0 space-y-6">
      {/* Core Identity Card Ghost */}
      <div className="p-5 border border-border/40 rounded-xl bg-card/20 space-y-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <Skeleton circle width={96} height={96} className="shrink-0" />
          <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
            {/* Full Name */}
            <Skeleton width="85%" height={20} className="rounded-sm" />
            {/* Username */}
            <Skeleton width="50%" height={12} className="rounded-sm opacity-50" />
            {/* Rank Ghost */}
            <div className="mt-4 space-y-1.5">
              <Skeleton width={35} height={10} className="opacity-30 uppercase" />
              <Skeleton width={80} height={18} className="rounded-sm" />
            </div>
          </div>
        </div>

        {/* Stats Row Ghost */}
        <div className="flex justify-start gap-4 pt-2 border-t border-border/10">
          <div className="flex items-center gap-1.5">
            <Skeleton width={20} height={16} />
            <Skeleton width={60} height={10} className="opacity-40 uppercase" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton width={20} height={16} />
            <Skeleton width={60} height={10} className="opacity-40 uppercase" />
          </div>
        </div>

        {/* Action Button Ghost */}
        <Skeleton height={44} className="rounded-lg w-full" />

        {/* Social Links Ghost */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton circle width={16} height={16} className="opacity-30" />
            <Skeleton width="70%" height={14} className="rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton circle width={16} height={16} className="opacity-30" />
            <Skeleton width="65%" height={14} className="rounded-sm" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Ghost */}
      <div className="space-y-1.5 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border border-transparent">
             <Skeleton circle width={14} height={14} className="opacity-30" />
             <Skeleton width={80} height={10} className="opacity-40 uppercase" />
          </div>
        ))}
      </div>
    </aside>
  </SkeletonProvider>
);

/**
 * Activity Heatmap Skeleton (Ghost of GritGraph)
 */
export const ActivitySkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="p-5 border border-border/40 rounded-xl bg-card/20 space-y-6 overflow-hidden">
      {/* Tactical Header Ghost */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton width={45} height={24} className="rounded-md" />
          <Skeleton width={180} height={12} className="opacity-40" />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
             <Skeleton width={100} height={10} className="opacity-30" />
             <Skeleton width={25} height={12} className="rounded-sm" />
          </div>
          <div className="hidden lg:flex items-center gap-2">
             <Skeleton width={80} height={10} className="opacity-30" />
             <Skeleton width={25} height={12} className="rounded-sm" />
          </div>
          <Skeleton width={100} height={28} className="rounded-md opacity-60" />
        </div>
      </div>

      {/* Heatmap Grid Ghost - Fixed size boxes and specific gap */}
      <div className="flex gap-[2.5px] overflow-x-auto custom-scrollbar pb-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="grid grid-rows-7 grid-flow-col gap-[2.5px]">
              {Array.from({ length: 38 }).map((_, j) => (
                <div key={j} className="w-[10px] h-[10px] rounded-[2px] bg-muted/40 border border-border/10" />
              ))}
            </div>
            <Skeleton width={28} height={8} className="mx-auto opacity-30" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Recent Activities Skeleton (Ghost of RecentActivities)
 */
export const RecentActivitiesSkeleton = ({ count = 5 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="p-6 border border-border/40 rounded-xl bg-card/10 space-y-4 overflow-hidden">
      {/* Header Ghost */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton circle width={14} height={14} className="opacity-30" />
          <Skeleton width={150} height={12} className="rounded-sm opacity-60 uppercase" />
        </div>
      </div>

      {/* Accordion Feed Ghost */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-3 pr-6 py-3 border border-border/40 bg-muted/10 rounded-lg flex items-center justify-between">
            <div className="flex-1 grid grid-cols-[220px_90px_90px_1fr_auto] items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton width={160} height={14} className="rounded-sm" />
                <Skeleton width={80} height={10} className="opacity-30 uppercase" />
              </div>
              <div className="flex justify-center">
                <Skeleton width={60} height={20} className="rounded-md opacity-40" />
              </div>
              <div className="flex justify-center items-center gap-1.5">
                <Skeleton circle width={10} height={10} className="opacity-20" />
                <Skeleton width={45} height={12} className="opacity-30" />
              </div>
              <div />
              <div className="flex justify-end">
                <Skeleton width={85} height={24} className="rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Solve Breakdown Skeleton (Ghost of SolveBreakdown)
 */
export const StatsSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="flex flex-row items-center justify-center gap-12 p-3 border border-border/40 rounded-xl bg-card/20 h-full">
      {/* Tactical Arc Ghost */}
      <div className="relative size-[155px] flex items-center justify-center shrink-0">
        <div className="absolute inset-0 rounded-full border-[6px] border-muted/10" />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline gap-1">
            <Skeleton width={50} height={28} className="rounded-sm" />
            <Skeleton width={30} height={14} className="opacity-30" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Skeleton circle width={10} height={10} className="opacity-30" />
            <Skeleton width={40} height={10} className="opacity-40 uppercase" />
          </div>
        </div>
      </div>

      {/* Difficulty Triple-Box Ghost */}
      <div className="flex-1 max-w-[130px] space-y-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-2 rounded-lg bg-muted/40 border border-border/10 flex flex-col items-center justify-center gap-1">
            <Skeleton width={50} height={10} className="opacity-40 uppercase" />
            <Skeleton width={60} height={14} className="rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Connect LeetCode CTA Skeleton (Standalone)
 */
export const ConnectLeetCodeSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-3 md:px-5 border border-dashed border-muted-foreground/20 bg-muted/5 rounded-xl gap-4 md:gap-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Skeleton circle width={24} height={24} className="opacity-20 shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Skeleton width={120} height={14} className="rounded-sm" />
          <Skeleton width="90%" height={10} className="opacity-30 rounded-sm hidden sm:block md:max-w-[300px]" />
        </div>
      </div>
      <Skeleton width="100%" height={36} className="rounded-md md:w-[110px] shrink-0" />
    </div>
  </SkeletonProvider>
);

/**
 * Badge Showcase Skeleton
 */
export const BadgeShowcaseSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="p-4 border border-border/40 rounded-xl bg-card/20 h-full flex flex-col justify-center gap-4">
      <div className="flex items-center justify-between px-1">
        <Skeleton width={100} height={16} className="rounded-sm" />
      </div>
      <div className="flex gap-3 justify-center items-center py-2">
         {Array.from({ length: 4 }).map((_, i) => (
           <Skeleton key={i} circle width={48} height={48} className="opacity-20" />
         ))}
      </div>
    </div>
  </SkeletonProvider>
);
/**
 * Profile Settings Form Skeleton
 */
export const ProfileSettingsSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="space-y-6">
      {/* Public Profile Card Ghost */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-card/20">
        <div className="p-6 border-b border-border/50 bg-muted/10">
          <div className="flex items-center gap-3">
            <Skeleton circle width={20} height={20} className="opacity-20" />
            <div className="space-y-1.5">
              <Skeleton width={120} height={16} className="rounded-sm" />
              <Skeleton width={180} height={10} className="opacity-30" />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`space-y-2 ${i === 3 ? "md:col-span-2" : ""}`}>
                <Skeleton width={100} height={10} className="opacity-30 uppercase" />
                <Skeleton height={40} className="rounded-lg w-full" />
              </div>
            ))}
          </div>
          <Skeleton width={140} height={44} className="rounded-lg" />
        </div>
      </div>

      {/* Security Card Ghost */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-card/20">
        <div className="p-6 border-b border-border/50 bg-muted/10">
          <div className="flex items-center gap-3">
            <Skeleton circle width={20} height={20} className="opacity-20" />
            <div className="space-y-1.5">
              <Skeleton width={150} height={16} className="rounded-sm" />
              <Skeleton width={220} height={10} className="opacity-30" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-border/50 rounded-xl bg-muted/5">
            <Skeleton width="60%" height={14} className="opacity-40" />
            <Skeleton width={140} height={36} className="rounded-md shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonProvider>
);
