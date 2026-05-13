"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useArenaHistoryQuery, useArenaMatchDetailsQuery } from "@/hooks/queries/use-arena.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ArenaMatchCard } from "./ArenaMatchCard";
import { ArenaMatchDetail } from "./ArenaMatchDetail";
import { ArenaHistorySkeleton } from "@/components/skeletons/ArenaSkeletons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ArenaMatch } from "@/types/arena";

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

interface ArenaHistoryTabProps {  
  userId: string;
}

export const ArenaHistoryTab: React.FC<ArenaHistoryTabProps> = ({ userId }) => {
  const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null);
  const { userId: currentClerkId } = useAuth();
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

  const expectedCount = totalCount > 0 
    ? Math.min(10, totalCount - (currentPage - 1) * 10)
    : 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            ARENA RECORDS
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">
            History of all competitive matches played
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="p-2"
          >
            {totalCount} TOTAL MATCHES
          </Badge>
        </div>
      </div>

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
          <>
            {isFetching ? (
               <ArenaHistorySkeleton count={expectedCount} />
            ) : (
              <div className="grid gap-4 transition-opacity duration-200">
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

            {/* Pagination Controls */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {totalCount > 0 && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Showing <span className="text-muted-foreground/60">{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)}</span> of <span className="text-muted-foreground/60">{totalCount}</span>
                </div>
              )}

              {totalPages > 1 && (
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
                    
                    {[...Array(totalPages)].map((_, i) => {
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
          </>
        )}
      </QueryGuard>
    </div>
  );
};
