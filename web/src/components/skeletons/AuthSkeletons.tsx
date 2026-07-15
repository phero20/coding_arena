"use client";

import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export const SignInSkeleton = () => (
  <SkeletonProvider>
    <div className="bg-card/50 border border-border rounded-xl p-6 w-full">
      <div className="flex flex-col gap-6">
        {/* Top Button Placeholder */}
        <Skeleton height={44} className="rounded-lg opacity-20" />
        
        {/* Divider Placeholder */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-border/50" />
          <Skeleton width={24} height={12} className="opacity-20" />
          <div className="flex-1 h-px bg-border/50" />
        </div>
        
        {/* Input Placeholder */}
        <div className="space-y-2">
          <Skeleton width={80} height={14} className="opacity-20" />
          <Skeleton height={44} className="rounded-lg opacity-20" />
        </div>
        
        {/* Bottom Button Placeholder */}
        <Skeleton height={44} className="rounded-lg opacity-20 mt-2" />
      </div>
    </div>
  </SkeletonProvider>
);
