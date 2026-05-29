"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
<<<<<<< HEAD
import { useArenaHistoryQuery, useArenaMatchDetailsQuery } from "@/hooks/queries/use-arena.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ArenaMatchCard } from "./ArenaMatchCard";
import { ArenaMatchDetail } from "./ArenaMatchDetail";
import { ArenaHistorySkeleton } from "@/components/skeletons/ArenaSkeletons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Swords } from "lucide-react";
=======
import { useArenaMatchDetailsQuery } from "@/hooks/queries/use-arena.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ArenaMatchDetail } from "./ArenaMatchDetail";
import { ArenaHistorySkeleton } from "@/components/skeletons/ArenaSkeletons";
import { Trophy, Swords, Users, ArrowRight } from "lucide-react";
>>>>>>> prod-deploy
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import type { ArenaMatch } from "@/types/arena";
=======
import { formatDistanceToNow } from "date-fns";

import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useArenaPagination } from "@/hooks/use-arena-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
>>>>>>> prod-deploy

interface ArenaHistoryTabProps {  
  userId: string;
}

export const ArenaHistoryTab: React.FC<ArenaHistoryTabProps> = ({ userId }) => {
  const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null);
  const { userId: currentClerkId } = useAuth();
<<<<<<< HEAD
  const { data: matches, isLoading, error, refetch } = useArenaHistoryQuery(userId);
=======
  const isOwner = userId === currentClerkId;

  const { 
    matches, 
    isLoading, 
    isFetching,
    error, 
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  } = useArenaPagination(userId, 10);
>>>>>>> prod-deploy
  
  const { 
    data: detailedMatch, 
    isLoading: isDetailLoading,
    error: detailError 
  } = useArenaMatchDetailsQuery(selectedMatchId);

  if (selectedMatchId) {
    return (
      <QueryGuard
        loading={isDetailLoading}
        error={detailError}
        data={detailedMatch}
        onRetry={() => {}}
        skeleton={<ArenaHistorySkeleton />}
      >
        {(match) => (
          <ArenaMatchDetail 
            match={match} 
            onBack={() => setSelectedMatchId(null)} 
          />
        )}
      </QueryGuard>
    );
  }

<<<<<<< HEAD
=======
  const expectedCount = totalCount > 0 
    ? Math.min(10, totalCount - (currentPage - 1) * 10)
    : 10;

>>>>>>> prod-deploy
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            ARENA RECORDS
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">
<<<<<<< HEAD
           Match History
=======
            History of all competitive matches played
>>>>>>> prod-deploy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
<<<<<<< HEAD
          >
            {matches?.length || 0} TOTAL MATCHES
=======
            className="p-2"
          >
            {totalCount} TOTAL MATCHES
>>>>>>> prod-deploy
          </Badge>
        </div>
      </div>

<<<<<<< HEAD
      <QueryGuard
        loading={isLoading}
        error={error}
        data={matches}
        skeleton={<ArenaHistorySkeleton />}
        onRetry={refetch}
        emptyTitle="Arena Empty"
        emptyMessage="You haven't played any matches yet. Ready to start?"
        emptyAction={
          <Link href="/arena">
            <Button size="sm" className="font-bold tracking-tight">
              ENTER THE ARENA
            </Button>
          </Link>
        }
      >
        {(matchList) => (
          <div className="grid gap-4">
            {matchList.map((match) => (
              <ArenaMatchCard
                key={match.id}
                match={match}
                currentUserId={userId}
                onSelect={(m) => setSelectedMatchId(m.id)}
              />
            ))}
          </div>
        )}
      </QueryGuard>
=======
      <div className="overflow-hidden border border-border/40 rounded-xl bg-card/60">
        <QueryGuard
          loading={isLoading || (isFetching && matches.length === 0)}
          error={error}
          data={matches}
          skeleton={<ArenaHistorySkeleton count={expectedCount} />}
          onRetry={refetch}
          emptyTitle={isOwner ? "Arena Empty" : "No Records Found"}
          emptyMessage={isOwner 
            ? "You haven't played any matches yet. Ready to start?" 
            : "This user hasn't played any matches yet."
          }
          emptyAction={isOwner ? (
            <Link href="/arena">
              <Button size="sm" className="font-bold tracking-tight">
                ENTER THE ARENA
              </Button>
            </Link>
          ) : undefined}
        >
          {(matchList) => (
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
                  <TableHead className="w-[50px] sm:w-[60px] pr-0 sm:pr-6 text-center">
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchList.map((match) => {
                  const myResult = match.players.find((p) => p.userId === userId);
                  return (
                    <TableRow
                      key={match.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedMatchId(match.id)}
                    >
                      <TableCell className="py-4 pl-4 sm:pl-6 border-b border-border/40">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="size-3 text-primary" />
                          <span className="text-xs font-black tabular-nums text-foreground/90">
                            {myResult?.submissionOrder || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pl-0 border-b border-border/40">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-xs tracking-tight truncate text-foreground/90 uppercase group-hover:text-primary transition-colors">
                              {match.problemTitle || match.problemSlug || "Arena Match"}
                            </span>
                            {match.difficulty && (
                              <Badge variant="secondary" className="uppercase text-[9px] font-black h-5 px-1.5 shrink-0 hidden md:flex">
                                {match.difficulty}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter truncate">
                            {match.language}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pl-0 border-b border-border/40">
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3 text-muted-foreground/60" />
                          <span className="text-[10px] font-black tabular-nums text-muted-foreground/80">
                            {match.players.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xs:table-cell py-4 text-right pr-6 border-b border-border/40 text-[10px] font-bold text-muted-foreground/70">
                        {formatDistanceToNow(new Date(match.startedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="py-4 pr-2 sm:pr-6 border-b border-border/40">
                        <div className="flex justify-center sm:justify-end">
                          <Button size="icon" variant="secondary" className="size-8">
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </QueryGuard>

        {/* Pagination Controls - Outside QueryGuard to remain visible during loading */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/10 bg-card/60">
          {(totalCount > 0 || isLoading) && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {isLoading ? (
                <span className="opacity-40 animate-pulse">Loading Arena Records...</span>
              ) : (
                <>
                  Showing <span className="text-muted-foreground/60">{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)}</span> of <span className="text-muted-foreground/60">{totalCount}</span>
                </>
              )}
            </div>
          )}

          {(totalPages > 1 || isLoading) && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(p => p - 1);
                    }}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                
                {!isLoading && Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(p => p + 1);
                    }}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
>>>>>>> prod-deploy
    </div>
  );
};
