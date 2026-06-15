"use client";

import {
  useLeaderboard,
  useLeaderboardSearch,
} from "@/hooks/stats/use-leaderboard";
import { useDebounce } from "@/hooks/shared/use-debounce";
import { useLeaderboardStore } from "@/store/use-leaderboard-store";
import { LeaderboardHeader } from "@/components/stats/leaderboard/LeaderboardHeader";
import { LeaderboardTable } from "@/components/stats/leaderboard/LeaderboardTable";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { LeaderboardResponse } from "@/types/stats";

interface LeaderboardClientProps {
  initialData: LeaderboardResponse;
}

export function LeaderboardClient({ initialData }: LeaderboardClientProps) {
  const { limit, offset, setOffset, searchQuery } = useLeaderboardStore();

  // Debounce search to avoid hammering the API
  const debouncedQuery = useDebounce(searchQuery, 400);
  const isSearching = debouncedQuery.length >= 2;

  // 1. Regular Paginated Leaderboard
  const {
    data: leaderboardData,
    isLoading: isLeaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useLeaderboard(limit, offset, initialData);

  // 2. Global Search Results
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useLeaderboardSearch(debouncedQuery);

  // Determine which data and state to show
  const displayEntries = isSearching
    ? searchData?.entries || []
    : leaderboardData?.entries || [];
  const isLoading = isSearching ? isSearchLoading : isLeaderboardLoading;
  const error = isSearching ? searchError : leaderboardError;
  const refetch = isSearching ? refetchSearch : refetchLeaderboard;

  const handleNextPage = () => {
    if (leaderboardData?.entries && leaderboardData.entries.length === limit) {
      setOffset(offset + limit);
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <LeaderboardHeader />

        <LeaderboardTable
          entries={displayEntries}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          viewerRank={leaderboardData?.viewerRank}
        />

        {!isSearching &&
          leaderboardData?.entries &&
          leaderboardData.entries.length > 0 && (
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 px-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Showing{" "}
                <span className="text-muted-foreground/60">
                  {offset + 1}-{Math.min(offset + limit, leaderboardData.total)}
                </span>{" "}
                of{" "}
                <span className="text-muted-foreground/60">
                  {leaderboardData.total}
                </span>{" "}
                users
              </div>

              {Math.ceil(leaderboardData.total / limit) > 1 && (
                <Pagination>
                  <PaginationContent className="border border-border/60 rounded-lg p-1 bg-card/40 backdrop-blur-sm">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePrevPage();
                        }}
                        className={cn(
                          offset === 0 && "pointer-events-none opacity-50",
                          "cursor-pointer",
                        )}
                      />
                    </PaginationItem>

                    {(() => {
                      const totalPages = Math.ceil(
                        leaderboardData.total / limit,
                      );
                      const currentPage = Math.floor(offset / limit) + 1;
                      const pages = [];

                      for (let i = 1; i <= totalPages; i++) {
                        if (
                          i === 1 ||
                          i === totalPages ||
                          (i >= currentPage - 1 && i <= currentPage + 1)
                        ) {
                          pages.push(
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === i}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setOffset((i - 1) * limit);
                                }}
                              >
                                {i}
                              </PaginationLink>
                            </PaginationItem>,
                          );
                        } else if (
                          i === currentPage - 2 ||
                          i === currentPage + 2
                        ) {
                          pages.push(
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>,
                          );
                        }
                      }
                      return pages;
                    })()}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNextPage();
                        }}
                        className={cn(
                          leaderboardData.entries.length < limit &&
                            "pointer-events-none opacity-50",
                          "cursor-pointer",
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
