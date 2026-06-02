"use client";

import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "@/components/skeletons/BaseSkeleton";
import { Card } from "@/components/ui/card";

export function CompaniesSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 pb-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <Card key={i} className="group flex flex-row items-center gap-6 overflow-hidden p-6 border-border/40 bg-card/50 h-full shadow-sm">
            {/* Logo Skeleton */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <Skeleton width={48} height={48} className="rounded-md" />
            </div>

            {/* Content Skeleton */}
            <div className="flex flex-1 flex-col justify-center min-w-0 space-y-2.5">
              <Skeleton width="80%" height={18} className="rounded-sm" />
              <div className="flex items-center gap-2">
                <Skeleton width={14} height={14} className="rounded-sm" />
                <Skeleton width="45%" height={12} className="rounded-sm opacity-70" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SkeletonProvider>
  );
}
