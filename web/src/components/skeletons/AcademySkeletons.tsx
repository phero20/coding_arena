import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export function AcademyTracksSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className="flex flex-row items-center gap-6 overflow-hidden p-6 border border-border/40 bg-card/20 rounded-xl h-full min-h-35"
          >
            {/* Icon Side Ghost */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center">
              <Skeleton width={80} height={80} className="opacity-20 rounded-md" />
            </div>

            {/* Content Side Ghost */}
            <div className="flex flex-1 flex-col gap-2 min-w-0">
              <Skeleton width="50%" height={24} className="rounded-sm" />

              <div className="flex items-center gap-1.5 mt-0.5">
                <Skeleton circle width={16} height={16} className="opacity-40" />
                <Skeleton width={90} height={14} className="rounded-sm opacity-60" />
              </div>

              {/* Tags Ghost */}
              <div className="mt-1 flex flex-wrap gap-2">
                <Skeleton width={60} height={22} className="rounded-md opacity-40" />
                <Skeleton width={80} height={22} className="rounded-md opacity-40" />
                <Skeleton width={50} height={22} className="rounded-md opacity-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonProvider>
  );
}
