import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Identity Sidebar Skeleton (Ghost of ProfileSidebar)
 */
export const IdentitySkeleton = () => (
  <SkeletonProvider>
    <div className="lg:w-80 shrink-0 space-y-6">
      <div className="p-5 border border-border/40 rounded-xl bg-card/20 space-y-5">
        <div className="flex gap-4">
          <Skeleton circle width={96} height={96} />
          <div className="flex flex-col justify-center gap-2 flex-1">
            <Skeleton width="80%" height={24} />
            <Skeleton width="50%" height={14} />
            <div className="mt-4 space-y-1">
              <Skeleton width="30%" height={10} />
              <Skeleton width="60%" height={18} />
            </div>
          </div>
        </div>

        <div className="flex justify-start gap-4 pt-2 border-t border-border/10">
          <Skeleton width={80} height={20} />
          <Skeleton width={80} height={20} />
        </div>

        <Skeleton height={44} className="rounded-lg w-full" />

        <div className="space-y-2 pt-2">
          <Skeleton width="90%" height={24} />
          <Skeleton width="85%" height={24} />
          <Skeleton width="80%" height={24} />
        </div>
      </div>

      <div className="space-y-4 px-1">
        <Skeleton width={100} height={20} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton width={60} height={24} />
              <Skeleton width={100} height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Activity Heatmap Skeleton (Ghost of GritGraph)
 */
export const ActivitySkeleton = () => (
  <SkeletonProvider>
    <div className="p-5 border border-border/40 rounded-xl bg-card/20 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Skeleton width={250} height={28} />
        <div className="flex items-center gap-4">
          <Skeleton width={100} height={16} />
          <Skeleton width={100} height={16} />
          <Skeleton width={100} height={28} />
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {Array.from({ length: 28 }).map((_, j) => (
                <Skeleton key={j} width={11} height={11} className="rounded-sm" />
              ))}
            </div>
            <Skeleton width={30} height={10} className="mx-auto" />
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
  <SkeletonProvider>
    <div className="p-6 border border-border/40 rounded-xl bg-card/20 space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <Skeleton width={180} height={16} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 border border-border/40 rounded-xl flex items-center justify-between bg-card/10">
            <div className="flex items-center gap-4 flex-1">
              <Skeleton circle width={24} height={24} />
              <div className="flex-1 space-y-2">
                <Skeleton width="40%" height={14} />
                <Skeleton width="20%" height={10} />
              </div>
            </div>
            <Skeleton width={60} height={20} className="rounded-md" />
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
  <SkeletonProvider>
    <div className="flex flex-row items-center justify-center gap-12 p-6 border border-border/40 rounded-xl bg-card/20">
      <div className="relative size-[155px] flex items-center justify-center">
        <Skeleton circle width={155} height={155} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Skeleton width={60} height={24} />
          <Skeleton width={40} height={12} className="mt-1" />
        </div>
      </div>
      <div className="flex-1 max-w-[130px] space-y-2">
        <Skeleton height={48} className="rounded-lg" />
        <Skeleton height={48} className="rounded-lg" />
        <Skeleton height={48} className="rounded-lg" />
      </div>
    </div>
  </SkeletonProvider>
);
