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

export function TrackDetailsSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="flex flex-col min-h-screen bg-background py-24">
        {/* Top Header & Tabs Row */}
        <div className="w-full bg-background relative z-10 border-b">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* SlugHeader Ghost */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 py-6">
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton width={56} height={56} className="rounded-xl opacity-20" />
                <Skeleton width={180} height={40} className="rounded-md" />
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-4 lg:gap-8 justify-start lg:justify-end opacity-60">
                <Skeleton width={100} height={20} className="rounded-sm" />
                <Skeleton width={100} height={20} className="rounded-sm" />
                <Skeleton width={100} height={20} className="rounded-sm" />
              </div>
            </div>
            
            {/* TabsList Ghost */}
            <div className="flex gap-8 mt-1 pb-4">
              <Skeleton width={80} height={24} className="rounded-sm opacity-40" />
              <Skeleton width={80} height={24} className="rounded-sm opacity-40" />
              <Skeleton width={80} height={24} className="rounded-sm opacity-40" />
            </div>
          </div>
        </div>
        
        {/* Content Ghost */}
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-20 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center border-t-2 border-border/50">
          <div className="flex-1 min-w-0 max-w-[850px] w-full">
            <Skeleton width="40%" height={32} className="mb-8 rounded-sm" />
            <Skeleton count={5} className="mb-4 rounded-sm opacity-40" />
            <Skeleton count={3} width="80%" className="mb-4 rounded-sm opacity-40" />
          </div>
          <div className="hidden lg:flex w-[350px] shrink-0 justify-center">
            <Skeleton circle width={224} height={224} className="opacity-10" />
          </div>
        </div>
      </div>
    </SkeletonProvider>
  );
}

export function ConceptViewSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Header Title Skeleton */}
        <div className="mb-10 flex flex-col items-center">
          <Skeleton width={200} height={40} className="mb-3 rounded-md" />
          <Skeleton width={150} height={20} className="rounded-md opacity-60" />
        </div>

        {/* Content Paragraphs & Blocks */}
        <div className="space-y-8">
          <div>
            <Skeleton width={180} height={28} className="mb-4 rounded-sm" />
            <Skeleton count={4} className="mb-3 rounded-sm opacity-40" />
            <Skeleton width="85%" className="rounded-sm opacity-40" />
          </div>

          {/* Fake Code Block */}
          <div className="border border-border/40 bg-card/10 rounded-lg p-5 space-y-2.5">
            <Skeleton width="40%" height={16} className="rounded-sm opacity-30" />
            <Skeleton width="70%" height={16} className="rounded-sm opacity-30" />
            <Skeleton width="55%" height={16} className="rounded-sm opacity-30" />
            <Skeleton width="80%" height={16} className="rounded-sm opacity-30" />
          </div>

          <div>
            <Skeleton width={120} height={28} className="mb-4 rounded-sm" />
            <Skeleton count={3} className="mb-3 rounded-sm opacity-40" />
            <Skeleton width="60%" className="rounded-sm opacity-40" />
          </div>
        </div>
      </div>
    </SkeletonProvider>
  );
}
