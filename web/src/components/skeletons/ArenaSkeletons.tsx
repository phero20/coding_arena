import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Arena Lobby Skeleton (Ghost of ArenaLobby)
 * Mirrors the lobby layout including players grid and invite cards
 */
export const LobbySkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="relative flex flex-col items-center gap-6 md:gap-12 pt-28 md:pt-42 pb-20 w-full min-h-screen overflow-hidden">
      
      {/* Top Right Actions Ghost */}
      <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-2 z-20 mb-6 md:mb-0 md:absolute md:top-24 md:right-0 px-4">
        <Skeleton width={120} height={36} className="rounded-md" />
        <Skeleton width={110} height={36} className="rounded-md" />
        <Skeleton width={90} height={36} className="rounded-md" />
      </div>

      {/* Arena Header Ghost */}
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center">
          <Skeleton circle width={24} height={24} className="opacity-20" />
        </div>
        <Skeleton width={180} height={32} className="rounded-md italic" />
      </div>

      {/* Problem & Invite Cards Ghost */}
      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6 px-4">
          {/* Problem Card */}
          <div className="inline-flex items-center gap-4 py-3 px-6 h-auto min-h-16 w-full max-w-2xl border border-border/40 rounded-xl bg-card/20">
            <Skeleton width={200} height={24} className="rounded-sm" />
            <div className="flex gap-2">
              <Skeleton width={60} height={20} className="rounded-md opacity-50" />
              <Skeleton width={60} height={20} className="rounded-md opacity-50" />
            </div>
          </div>
          
          {/* Invite Code Card */}
          <div className="flex items-center justify-between gap-6 px-6 py-3 h-16 min-w-[280px] w-full md:w-auto border border-border/40 rounded-xl bg-card/20">
            <div className="flex flex-col gap-1.5">
              <Skeleton width={60} height={10} className="opacity-40" />
              <Skeleton width={140} height={24} className="rounded-sm" />
            </div>
            <Skeleton width={32} height={32} className="rounded-md" />
          </div>
        </div>
      </div>

      {/* Participants Ghost Section */}
      <div className="flex flex-col gap-4 w-full max-w-7xl px-4 mt-8">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Skeleton width={100} height={12} className="opacity-40 uppercase" />
            <Skeleton width={45} height={20} className="rounded-md opacity-20" />
          </div>
        </div>
        
        <div className="w-full flex justify-center py-1">
          <Skeleton width={160} height={10} className="opacity-30" />
        </div>

        {/* Participants Grid - Sync with Actual Grid Breakpoints */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-2.5 border border-border/40 rounded-xl flex items-center justify-between gap-3 bg-card/10">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Avatar */}
                <Skeleton circle width={32} height={32} className="shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Skeleton width="60%" height={12} className="rounded-sm" />
                    {i === 0 && <Skeleton width={35} height={14} className="rounded-sm opacity-50" />}
                  </div>
                  <Skeleton width="40%" height={10} className="rounded-sm opacity-30" />
                </div>
              </div>
            </div>
          ))}
          {/* Empty Slot Ghost */}
          <div className="flex items-center justify-center p-3 border border-dashed border-border/40 rounded-xl bg-muted/20 min-h-[50px]">
            <Skeleton width={140} height={10} className="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Match Results Skeleton
 * Mirrors the post-match standings view
 */
export const MatchResultsSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="min-h-screen pb-24 flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-10 space-y-8 overflow-hidden">
      {/* Header Section Ghost */}
      <div className="w-full flex items-center justify-between py-2 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <Skeleton circle width={48} height={48} className="opacity-20" />
          <Skeleton width={180} height={32} className="rounded-md" />
        </div>
        <Skeleton width={110} height={36} className="rounded-md" />
      </div>

      {/* Podium Section Ghost */}
      <div className="flex flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-3xl py-4">
        {/* Rank 2 */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <Skeleton circle width={64} height={64} className="md:w-24 md:h-24" />
          <Skeleton width={80} height={14} className="rounded-sm" />
          <Skeleton width={60} height={20} className="rounded-full opacity-40" />
        </div>
        {/* Rank 1 */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Skeleton circle width={80} height={80} className="md:w-32 md:h-32 border-4 border-primary/20" />
          <Skeleton width={100} height={16} className="rounded-sm" />
          <Skeleton width={70} height={24} className="rounded-full opacity-60" />
        </div>
        {/* Rank 3 */}
        <div className="flex flex-col items-center gap-3 mt-12">
          <Skeleton circle width={56} height={56} className="md:w-20 md:h-20" />
          <Skeleton width={80} height={14} className="rounded-sm" />
          <Skeleton width={60} height={20} className="rounded-full opacity-40" />
        </div>
      </div>

      {/* Leaderboard Card Ghost */}
      <div className="w-full border border-border/40 rounded-xl overflow-hidden bg-card/20">
        <div className="p-4 border-b border-border/40 bg-muted/20">
          <Skeleton width={120} height={20} className="rounded-sm" />
        </div>
        <div className="p-0">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-border/40 bg-muted/10">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="60%" height={10} className="opacity-30" />
            ))}
          </div>
          <div className="divide-y divide-border/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
                <Skeleton width={24} height={18} className="rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton circle width={24} height={24} />
                  <Skeleton width={80} height={12} />
                </div>
                <Skeleton width={40} height={14} className="mx-auto" />
                <Skeleton width={40} height={14} className="mx-auto" />
                <Skeleton width={60} height={14} className="mx-auto" />
                <div className="flex justify-end">
                  <Skeleton width={80} height={24} className="rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Arena History Skeleton
 * Mirrors the ArenaMatchCard list view in the profile
 */
export const ArenaHistorySkeleton = ({ count = 10 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border/40 rounded-xl overflow-hidden bg-card/10">
          <div className="py-4 px-4 sm:px-6 flex items-center justify-between">
            {/* Match Info Sector Ghost */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton width={200} height={18} className="sm:h-5 rounded-sm" />
                <div className="hidden sm:flex gap-2">
                  <Skeleton width={60} height={20} className="rounded-md opacity-40" />
                  <Skeleton width={70} height={20} className="rounded-md opacity-40" />
                </div>
              </div>
              <Skeleton width={120} height={10} className="rounded-sm opacity-30" />
            </div>

            {/* Performance Sector Ghost */}
            <div className="flex items-center gap-4 sm:gap-8 shrink-0 border-l border-border/10 pl-4 sm:pl-8">
              <div className="flex flex-col items-center gap-1.5">
                <Skeleton width={32} height={8} className="opacity-30" />
                <Skeleton width={24} height={20} className="rounded-sm" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Skeleton width={60} height={8} className="opacity-30" />
                <Skeleton width={24} height={20} className="rounded-sm" />
              </div>
              <Skeleton width={36} height={36} className="rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonProvider>
);
