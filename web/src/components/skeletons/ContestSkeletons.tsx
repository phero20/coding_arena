import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export const ContestHeroSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="relative mb-10 overflow-hidden border border-border/40 bg-card/20 rounded-xl shadow-sm">
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton width={120} height={24} className="rounded-md opacity-50" />
          <Skeleton width="80%" height={40} className="rounded-md" />
          <div className="flex gap-4 mt-2">
            <Skeleton width={100} height={16} className="rounded-sm opacity-40" />
            <Skeleton width={100} height={16} className="rounded-sm opacity-40" />
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col items-start gap-4 rounded-xl border border-border/40 bg-muted/20 p-6 lg:w-auto lg:items-end">
          <Skeleton width={80} height={16} className="opacity-50" />
          <Skeleton width={180} height={48} className="rounded-md" />
          <Skeleton width={120} height={40} className="rounded-md opacity-60" />
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

export const ContestListSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex h-[350px] flex-col overflow-hidden border border-border/40 bg-card/20 rounded-xl">
          <div className="flex flex-col p-5 space-y-4 h-full">
            <div className="flex justify-between items-center">
              <Skeleton width={60} height={16} className="opacity-40" />
              <Skeleton width={80} height={16} className="opacity-40" />
            </div>
            <Skeleton width="90%" height={40} className="rounded-md" />
            
            <div className="space-y-3 mt-auto pt-4">
              <Skeleton width="100%" height={48} className="rounded-md opacity-60" />
              <Skeleton width="100%" height={48} className="rounded-md opacity-60" />
              <Skeleton width="100%" height={48} className="rounded-md opacity-60" />
              <div className="pt-2">
                <Skeleton width="100%" height={40} className="rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonProvider>
);
