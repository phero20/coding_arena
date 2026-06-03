import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArenaLogo } from "../arena/ArenaLogo";

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
export const MatchResultsSkeleton = ({ count = 5 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="relative min-h-screen pb-24 flex flex-col items-center w-full max-w-7xl mx-auto px-0 py-10 space-y-8 overflow-hidden">
      {/* Header Section Ghost */}
      <div className="w-full flex items-center justify-between py-2 border-b border-border pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12  shrink-0">
            <ArenaLogo className="w-full h-full hover:scale-105 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase opacity-50">
            Match Results
          </h1>
        </div>
        <Skeleton width={110} height={36} className="rounded-md" />
      </div>

      {/* Podium Section Ghost */}
      <div className="flex flex-row items-center justify-center gap-2 w-full max-w-3xl py-4 relative z-10">
        {/* Rank 2 */}
        <div className="order-1 flex flex-col items-center gap-3 mt-12 px-2">
          <Skeleton circle width={72} height={72} className="md:w-24 md:h-24" />
          <Skeleton width={80} height={14} className="rounded-sm" />
          <Skeleton width={60} height={20} className="rounded-full opacity-40" />
        </div>
        {/* Rank 1 */}
        <div className="order-2 flex flex-col items-center gap-3 mb-8 px-4">
          <Skeleton circle width={96} height={96} className="md:w-32 md:h-32 border-4 border-primary/20" />
          <Skeleton width={100} height={16} className="rounded-sm" />
          <Skeleton width={70} height={24} className="rounded-full opacity-60" />
        </div>
        {/* Rank 3 */}
        <div className="order-3 flex flex-col items-center gap-3 mt-16 px-2">
          <Skeleton circle width={56} height={56} className="md:w-20 md:h-20" />
          <Skeleton width={80} height={14} className="rounded-sm" />
          <Skeleton width={60} height={20} className="rounded-full opacity-40" />
        </div>
      </div>

      {/* Leaderboard Card Ghost */}
      <Card className="overflow-hidden w-full relative z-10 bg-card/50 backdrop-blur-sm shadow-xl border-border/40">
        <CardHeader className="border-b border-border/10 bg-muted/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-12 md:h-12  shrink-0">
              <ArenaLogo className="w-full h-full hover:scale-105 transition-transform duration-300" />
            </div>
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-50">
              Leaderboard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow className="">
                <TableHead className="w-[80px] text-[10px] font-black uppercase text-muted-foreground pl-6">
                  Rank
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">
                  Player
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Score
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Precision
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Speed
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right">
                  Verdict
                </TableHead>
                <TableHead className="w-[100px] pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: count }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell className="py-4 pl-6 border-b border-border/20">
                    <Skeleton width={24} height={24} className="rounded-md" />
                  </TableCell>
                  <TableCell className="py-4 border-b border-border/20">
                    <div className="flex items-center gap-2.5">
                      <Skeleton circle width={32} height={32} />
                      <div className="flex flex-col gap-1">
                        <Skeleton width={100} height={14} className="rounded-sm" />
                        <Skeleton width={60} height={10} className="rounded-sm opacity-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 border-b border-border/20 text-center">
                    <Skeleton width={40} height={24} className="mx-auto rounded-md" />
                  </TableCell>
                  <TableCell className="py-4 border-b border-border/20 text-center">
                    <Skeleton width={48} height={14} className="mx-auto rounded-sm opacity-60" />
                  </TableCell>
                  <TableCell className="py-4 border-b border-border/20 text-center">
                    <Skeleton width={64} height={14} className="mx-auto rounded-sm opacity-60" />
                  </TableCell>
                  <TableCell className="py-4 border-b border-border/20 text-right">
                    <div className="flex justify-end">
                      <Skeleton width={70} height={20} className="rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 pr-6 border-b border-border/20 text-right">
                    <Skeleton width={24} height={24} className="ml-auto rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </SkeletonProvider>
);
/**
 * Arena History Skeleton
 * Mirrors the ArenaMatchCard list view in the profile
 */
export const ArenaHistorySkeleton = ({ count = 10 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="overflow-hidden border border-border/40 rounded-xl bg-card/10">
      <Table className="table-fixed border-separate border-spacing-0 w-full">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/10">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-4 sm:pl-6 w-[60px] sm:w-[100px] text-muted-foreground">
              Rank
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
              Match
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 w-[60px] sm:w-[100px] text-muted-foreground">
              Players
            </TableHead>
            <TableHead className="hidden xs:table-cell text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[120px] text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="w-[50px] sm:w-[60px] pr-0 sm:pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: count }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell className="py-4 pl-4 sm:pl-6 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <Skeleton circle width={12} height={12} className="opacity-20" />
                  <Skeleton width={16} height={14} className="rounded-sm" />
                </div>
              </TableCell>
              <TableCell className="py-4 pl-0 border-b border-border/40">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Skeleton width="80%" height={14} className="rounded-sm" />
                  <Skeleton width="40%" height={10} className="rounded-sm opacity-30" />
                </div>
              </TableCell>
              <TableCell className="py-4 pl-0 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <Skeleton circle width={12} height={12} className="opacity-20" />
                  <Skeleton width={16} height={10} className="rounded-sm opacity-40" />
                </div>
              </TableCell>
              <TableCell className="hidden xs:table-cell py-4 text-right pr-6 border-b border-border/40">
                <Skeleton width={60} height={10} className="ml-auto rounded-sm opacity-30" />
              </TableCell>
              <TableCell className="py-4 pr-2 sm:pr-6 border-b border-border/40">
                <div className="flex justify-center sm:justify-end">
                  <Skeleton width={32} height={32} className="rounded-md opacity-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </SkeletonProvider>
);
