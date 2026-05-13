import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Solutions Skeleton
 * Mirrors the SolutionsTab list view in the profile
 */
export const SolutionsSkeleton = ({ count = 10 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border/10 rounded-xl overflow-hidden bg-muted/20">
          <div className="p-3 sm:p-4 flex flex-row items-center justify-between gap-4">
            {/* Primary Info Sector Ghost */}
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <div className="size-10 rounded-lg bg-background border border-border/10 flex items-center justify-center shrink-0">
                <Skeleton width={20} height={20} className="opacity-20" />
              </div>
              
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton width="60%" height={16} className="rounded-sm" />
                  <Skeleton width={80} height={20} className="rounded-md opacity-40 shrink-0" />
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Skeleton width={120} height={10} className="rounded-sm opacity-30" />
                  <Skeleton width={100} height={10} className="rounded-sm opacity-30" />
                </div>
              </div>
            </div>

            {/* Stats & Actions Ghost */}
            <div className="flex items-center justify-end gap-3 shrink-0 sm:border-l border-border/10 sm:pl-8">
              <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <Skeleton width={40} height={8} className="opacity-30" />
                <Skeleton width={24} height={18} className="rounded-sm" />
              </div>

              <Skeleton width={120} height={36} className="rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonProvider>
);
