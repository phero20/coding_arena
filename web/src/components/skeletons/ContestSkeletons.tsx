import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export const ContestHeroSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="relative mb-10 overflow-hidden bg-transparent shadow-none border-none">
      <div className="relative z-10 flex flex-col items-start gap-6 p-5 sm:p-6 lg:flex-row lg:items-start">
        <div className="flex w-full items-start gap-5">
          <Skeleton width={48} height={48} className="rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton width={80} height={20} className="rounded-full" />
            <Skeleton width="80%" height={36} className="rounded-md" />
            <div className="flex gap-4 mt-2">
              <Skeleton width={120} height={36} className="rounded-md opacity-60" />
              <Skeleton width={120} height={36} className="rounded-md opacity-60" />
            </div>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-4 bg-card p-5 sm:p-6 lg:w-auto shadow-none rounded-xl border border-border">
          <Skeleton width={240} height={40} className="rounded-md" />
          <Skeleton width="100%" height={44} className="rounded-md" />
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

export const ContestListSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex h-full flex-col overflow-hidden border border-border bg-card rounded-xl">
          <div className="flex flex-col p-5 h-full">
            <div className="mb-3 flex items-start justify-between gap-4">
              <Skeleton width={80} height={20} className="rounded-sm opacity-60" />
              <Skeleton width={60} height={20} className="rounded-full opacity-60" />
            </div>
            
            <Skeleton width="100%" height={28} className="rounded-md mb-2" />
            <Skeleton width="70%" height={28} className="rounded-md mb-5" />
            
            <div className="mt-auto space-y-2">
              <Skeleton width="100%" height={36} className="rounded-md opacity-70" />
              <Skeleton width="100%" height={36} className="rounded-md opacity-70" />
              <Skeleton width="100%" height={36} className="rounded-md opacity-70" />
              
              <div className="pt-2">
                <Skeleton width="100%" height={40} className="rounded-md mt-4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonProvider>
);