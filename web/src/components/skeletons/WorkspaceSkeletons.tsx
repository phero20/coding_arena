import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Full-screen Workspace Skeleton (Ghost of BaseWorkspace)
 * Perfectly mirrors the IDE layout including Header and Panels
 */
export const WorkspaceSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header Ghost */}
      <header className="h-14 px-4 border-b border-border/40 bg-card/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton width={80} height={32} className="rounded-md" />
          <div className="hidden sm:block ml-2">
            <Skeleton width={140} height={10} className="rounded-sm opacity-40" />
          </div>
        </div>
        
        {/* Timer Ghost - Centered */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
          <Skeleton width={100} height={32} className="rounded-lg" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton width={70} height={32} className="rounded-md" />
          <Skeleton width={90} height={32} className="rounded-md" />
        </div>
      </header>

      {/* Desktop Layout Ghost */}
      <div className="flex-1 hidden md:flex min-h-0">
        {/* Description Panel Ghost (42%) */}
        <div className="w-[42%] border-r border-border/40 bg-card/20 flex flex-col">
          <div className="h-10 border-b border-border/40 bg-muted/30 flex items-center px-4 gap-4">
            <Skeleton width={80} height={12} />
            <Skeleton width={80} height={12} />
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-hidden">
            <Skeleton width="70%" height={28} className="rounded-md" />
            <div className="flex gap-2">
              <Skeleton width={60} height={20} className="rounded-md" />
              <Skeleton width={60} height={20} className="rounded-md" />
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton count={12} height={14} className="rounded-sm" />
            </div>
          </div>
        </div>

        {/* Editor Panel Ghost (58%) */}
        <div className="flex-1 bg-card/5 flex flex-col">
          <div className="h-10 border-b border-border/40 bg-muted/20 flex items-center justify-between px-4">
            <div className="flex gap-4">
              <Skeleton width={100} height={12} />
              <Skeleton width={60} height={12} className="opacity-50" />
            </div>
            <Skeleton width={120} height={24} className="rounded-md" />
          </div>
          <div className="flex-1 p-4 space-y-3 font-mono">
            <Skeleton width="40%" height={14} />
            <Skeleton width="60%" height={14} />
            <Skeleton width="20%" height={14} className="ml-4" />
            <Skeleton width="80%" height={14} className="ml-4" />
            <Skeleton width="30%" height={14} className="ml-8" />
            <Skeleton width="50%" height={14} className="ml-4" />
          </div>
          {/* Console Ghost */}
          {/* <div className="h-1/3 border-t border-border/40 bg-muted/30 p-4">
            <div className="flex gap-4 mb-4">
              <Skeleton width={80} height={12} />
              <Skeleton width={80} height={12} />
            </div>
            <Skeleton count={3} height={12} className="opacity-30" />
          </div> */}
        </div>
      </div>

      {/* Mobile Layout Ghost */}
      <div className="flex-1 flex flex-col md:hidden overflow-y-auto">
        <section className="h-[450px] border-b border-border/40 bg-card/20 p-6 space-y-6 shrink-0">
          <Skeleton width="60%" height={24} />
          <div className="flex gap-2">
            <Skeleton width={60} height={18} />
            <Skeleton width={60} height={18} />
          </div>
          <Skeleton count={8} height={12} />
        </section>
        <section className="flex-1 bg-card/10 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton width={100} height={20} />
            <Skeleton width={80} height={28} />
          </div>
          <Skeleton count={10} height={14} />
        </section>
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Compiler Workspace Skeleton
 */
export const CompilerWorkspaceSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="h-14 px-4 border-b border-border/40 bg-card/10 flex items-center justify-between">
        <Skeleton width={100} height={32} />
        <div className="flex gap-2">
          <Skeleton width={80} height={32} />
        </div>
      </header>
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="flex-1 md:w-3/5 border-r border-border/40 bg-card/20 p-6">
          <Skeleton count={15} height={14} />
        </div>
        <div className="h-1/2 md:h-full md:w-2/5 bg-muted/20 p-6">
          <Skeleton count={10} height={14} />
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
