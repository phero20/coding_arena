import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Full-screen Workspace Skeleton (Ghost of BaseWorkspace)
 * Perfectly mirrors the IDE layout including Header and Panels
 */
export const WorkspaceSkeleton = () => (
  <SkeletonProvider>
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header Ghost */}
      <header className="h-14 px-4 border-b border-border/40 bg-card/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton width={80} height={32} />
          <Skeleton width={120} height={10} className="ml-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={100} height={32} />
          <Skeleton width={100} height={32} />
        </div>
      </header>

      {/* Main Layout Ghost */}
      <div className="flex-1 flex min-h-0">
        {/* Description Panel Ghost */}
        <div className="w-[42%] border-r border-border/40 p-6 space-y-6">
          <Skeleton width="60%" height={28} />
          <div className="flex gap-2">
            <Skeleton width={60} height={20} />
            <Skeleton width={60} height={20} />
          </div>
          <div className="space-y-3">
            <Skeleton count={10} />
          </div>
        </div>
        {/* Editor Panel Ghost */}
        <div className="flex-1 bg-card/10 p-4">
          <div className="h-full border border-border/20 rounded-lg p-4 space-y-2">
            <Skeleton count={20} />
          </div>
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Workspace Console Skeleton (Generic)
 */
export const ConsoleSkeleton = () => (
  <SkeletonProvider>
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex gap-2">
        <Skeleton width={80} height={24} />
        <Skeleton width={80} height={24} />
      </div>
      <div className="flex-1 border border-border/20 rounded-md p-4">
        <Skeleton count={5} />
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Test Case Skeleton (Ghost of Tests Tab)
 */
export const TestCaseSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="flex flex-col gap-6 py-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} width={80} height={32} borderRadius="0.5rem" />
        ))}
      </div>
      <div className="space-y-5">
        <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/10">
          <Skeleton width={100} height={12} />
          <Skeleton height={40} className="mt-2" />
        </div>
        <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/10">
          <Skeleton width={100} height={12} />
          <Skeleton height={40} className="mt-2" />
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Execution Result Skeleton (Ghost of Results Tab)
 */
export const ResultSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="flex-1 flex flex-col gap-6 py-4">
      {/* Status Header Ghost */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton width={100} height={12} />
        <Skeleton width={80} height={24} className="rounded-md" />
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={80} height={32} borderRadius="0.5rem" />
          ))}
        </div>
        
        <div className="space-y-5">
          <Skeleton width={120} height={14} className="mb-2" />
          <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/10">
            <Skeleton width={80} height={12} />
            <Skeleton height={32} className="mt-2" />
          </div>
          <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/10">
            <Skeleton width={80} height={12} />
            <Skeleton height={32} className="mt-2" />
          </div>
          <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/10">
            <Skeleton width={80} height={12} />
            <Skeleton height={32} className="mt-2" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonProvider>
);
