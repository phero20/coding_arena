"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserSolutions } from "@/hooks/queries/use-solution.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  ChevronRight, 
  FileCode2,
  Clock,
  ExternalLink,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SolutionsSkeleton } from "@/components/skeletons/SolutionSkeletons";

import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useSolutionPagination } from "@/hooks/use-solution-pagination";

interface SolutionsTabProps {
  userId: string;
}

export const SolutionsTab: React.FC<SolutionsTabProps> = ({ userId }) => {
  const { userId: currentClerkId } = useAuth();
  const isOwner = userId === currentClerkId;
  
  const { 
    items: solutions, 
    isLoading, 
    isFetching, 
    error, 
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  } = useSolutionPagination(userId, 10);

  const expectedCount = totalCount > 0 
    ? Math.min(10, totalCount - (currentPage - 1) * 10)
    : 5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <h2 className="text-xl font-black tracking-tight uppercase">
              Community Solutions
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Uploaded Solutions and explanations for various problems by {isOwner ? "you" : "this user"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="p-2">
            {totalCount} TOTAL SOLUTIONS
          </Badge>
        </div>
      </div>

      <QueryGuard
        loading={isLoading || (isFetching && solutions.length === 0)}
        error={error}
        data={solutions}
        onRetry={refetch}
        skeleton={<SolutionsSkeleton count={expectedCount} />}
        emptyIcon={CheckCircle2}
        emptyTitle={isOwner ? "No Solutions" : "No Solutions Found"}
        emptyMessage={isOwner 
          ? "You haven't uploaded any solutions yet." 
          : "This user hasn't uploaded any solutions yet."
        }
      >
        {(sols) => (
          <>
            {isFetching ? (
              <SolutionsSkeleton count={expectedCount} />
            ) : (
              <div className="flex flex-col gap-3">
                {sols.map((sol) => (
                  <Card key={sol.id} className="group">
                    <CardContent className="py-4 px-4 sm:px-6">
                      <div className="flex flex-row items-center justify-between gap-4">
                        {/* Primary Info Sector */}
                        <div className="flex-1 min-w-0 flex items-center gap-4">
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <h3 className="font-bold text-sm tracking-tight truncate text-foreground/90 uppercase whitespace-nowrap overflow-hidden group-hover:text-primary transition-colors">
                                {sol.title}
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <span className="text-muted-foreground/40">
                                  PROBLEM
                                </span>
                                <span className="text-foreground/80">
                                  {sol.problemTitle || "Unknown"}
                                </span>
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="size-3 text-muted-foreground/40" />
                                {formatDistanceToNow(new Date(sol.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-end gap-3 shrink-0">
                          <Button variant="secondary" className="h-9 px-3 gap-2">
                            <ThumbsUp className="size-4 text-primary/60" />
                            <span className="text-sm font-black tabular-nums leading-none">
                              {sol.upvotes}
                            </span>
                          </Button>

                          <Link
                            href={`/problems/${sol.problemSlug || sol.problemId}?tab=solutions&solTab=my-solutions&solId=${sol.id}`}
                            className="shrink-0"
                          >
                            <Button size="sm" className="h-9 font-bold uppercase tracking-tight gap-1">
                              <span className="hidden sm:block">View Solution</span>
                              <ChevronRight className="size-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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