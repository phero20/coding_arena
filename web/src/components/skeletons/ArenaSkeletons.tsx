import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Arena Lobby Skeleton (Ghost of ArenaLobby)
 * Mirrors the lobby layout including players grid and invite cards
 */
export const LobbySkeleton = () => (
  <SkeletonProvider>
    <div className="relative flex flex-col items-center gap-12 pt-42 pb-20 duration-500 w-full min-h-screen bg-background">
      {/* Header Ghost */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton circle width={48} height={48} />
        <Skeleton width={200} height={40} />
      </div>

      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="inline-flex items-center gap-4 py-3 px-6 h-16 w-[400px] border border-border/40 rounded-xl">
             <Skeleton width={180} height={24} />
             <Skeleton width={60} height={20} />
          </div>
          <div className="flex items-center justify-between gap-6 px-6 py-3 h-16 w-[280px] border border-border/40 rounded-xl">
             <div className="flex flex-col gap-1">
               <Skeleton width={60} height={10} />
               <Skeleton width={120} height={24} />
             </div>
             <Skeleton width={32} height={32} />
          </div>
        </div>
      </div>

      {/* Participants Ghost */}
      <div className="flex flex-col gap-4 w-full max-w-7xl px-4">
        <div className="flex items-center gap-2 px-1">
          <Skeleton width={100} height={12} />
          <Skeleton width={40} height={20} />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-3 border border-border/40 rounded-xl flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <div className="flex-1">
                <Skeleton width="80%" height={14} />
              </div>
            </div>
          ))}
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
  <SkeletonProvider>
    <div className="h-screen flex flex-col items-center w-full max-w-4xl mx-auto py-10 space-y-8 bg-background">
      <div className="w-full flex items-center justify-between border-b border-border/10 pb-6">
        <div className="flex items-center gap-3">
          <Skeleton circle width={48} height={48} />
          <Skeleton width={150} height={32} />
        </div>
        <Skeleton width={100} height={36} />
      </div>

      <div className="flex items-center justify-center gap-4 w-full">
         <Skeleton width={120} height={180} />
         <Skeleton width={140} height={220} />
         <Skeleton width={120} height={180} />
      </div>

      <div className="w-full space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={64} className="rounded-xl" />
        ))}
      </div>
    </div>
  </SkeletonProvider>
);

/**
 * Arena History Skeleton
 * Mirrors the ArenaMatchCard list view in the profile
 */
export const ArenaHistorySkeleton = () => (
  <SkeletonProvider>
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 sm:p-5 border border-border/40 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/20">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton width={48} height={48} className="rounded-xl" />
            <div className="space-y-2">
              <Skeleton width={180} height={18} />
              <div className="flex gap-3">
                <Skeleton width={60} height={12} />
                <Skeleton width={80} height={12} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
             <div className="flex gap-4">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton width={40} height={8} />
                  <Skeleton width={30} height={16} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton width={40} height={8} />
                  <Skeleton width={40} height={16} />
                </div>
             </div>
             <div className="flex -space-x-2">
                <Skeleton circle width={28} height={28} />
                <Skeleton circle width={28} height={28} />
                <Skeleton circle width={28} height={28} />
             </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonProvider>
);
