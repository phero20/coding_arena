import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Premium Skeleton Provider
 * Ensures all skeletons share the same 'Industrial Dark' theme
 */
const SkeletonProvider = ({ 
  children, 
  noWrapper = false 
}: { 
  children: React.ReactNode;
  noWrapper?: boolean;
}) => (
  <SkeletonTheme
    baseColor="var(--muted)"
    highlightColor="var(--card)"
    duration={1.5}
    borderRadius="0.5rem"
  >
    {noWrapper ? (
      children
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    )}
  </SkeletonTheme>
);

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
          <Skeleton width={120} height={20} className="ml-4" />
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
 * Problem Table Row Skeleton (Ghost of ProblemRow)
 */
export const ProblemRowSkeleton = ({ count = 8 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <TableBody>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-t border-border/40 h-16">
          <TableCell className="pl-4 pr-0 md:pr-4 py-4 w-12">
            <Skeleton width={20} height={12} />
          </TableCell>
          <TableCell className="px-0 md:px-4 py-4">
            <div className="flex flex-col gap-1 min-w-0">
              <Skeleton width="80%" height={16} />
              <Skeleton width="40%" height={10} />
            </div>
          </TableCell>
          <TableCell className="px-4 py-4 w-20 sm:w-32">
            <Skeleton width={60} height={24} className="rounded-md" />
          </TableCell>
          <TableCell className="px-4 py-4 w-40 hidden md:table-cell">
            <div className="flex gap-1.5">
              <Skeleton width={45} height={18} />
              <Skeleton width={45} height={18} />
            </div>
          </TableCell>
          <TableCell className="px-4 py-4 text-right w-24 sm:w-28 whitespace-nowrap">
            <Skeleton width={64} height={32} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </SkeletonProvider>
);

/**
 * Match Results Skeleton (New)
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
 * Workspace Console Skeleton
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
 * Submission History Item Skeleton
 */
export const SubmissionSkeleton = ({ count = 3 }: { count?: number }) => (
  <SkeletonProvider>
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-border/40 rounded-lg flex justify-between items-center">
          <div className="space-y-2 flex-1">
             <Skeleton width="40%" height={14} />
             <Skeleton width="20%" height={10} />
          </div>
          <Skeleton width={60} height={24} />
        </div>
      ))}
    </div>
  </SkeletonProvider>
);


