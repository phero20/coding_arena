"use client";

import { useUser } from "@clerk/nextjs";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  CheckCircle2
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SolutionsTabProps {
  username: string;
}

export const SolutionsTab: React.FC<SolutionsTabProps> = ({ username }) => {
  const { user: currentUser } = useUser();
  const isOwner = username === currentUser?.username;
  
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
  } = useSolutionPagination(username, 10);

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

      <div className="overflow-hidden border border-border/40 rounded-xl bg-card/60">
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
            <Table className="table-fixed border-separate border-spacing-0 w-full">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-b border-border/10">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-[100px] text-muted-foreground">
                    Votes
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
                    Solution
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[120px] text-muted-foreground">
                    Submitted
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sols.map((sol) => (
                  <TableRow
                    key={sol.id}
                    className="group cursor-pointer transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 border-b border-border/40">
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="size-3 text-primary" />
                        <span className="text-xs font-black tabular-nums text-foreground/90">
                          {sol.upvotes}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pl-0 border-b border-border/40">
                      <Link
                        href={(() => {
                          const pid = sol.problemId;
                          const solTab = isOwner ? "my-solutions" : "community";
                          
                          if (!/^\d+$/.test(pid) && pid.includes(":")) {
                            const [track, ex] = pid.split(":");
                            return `/academy/tracks/${track}/exercises/${ex}?tab=solutions&solTab=${solTab}&solId=${sol.id}`;
                          }
                          
                          return `/problems/${sol.problemSlug || pid}?tab=solutions&solTab=${solTab}&solId=${sol.id}`;
                        })()}
                        className="flex flex-col min-w-0"
                      >
                        <span className="font-bold text-xs tracking-tight truncate text-foreground/90 uppercase group-hover:text-primary transition-colors">
                          {sol.title}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground/40 truncate">
                          {sol.problemTitle || "Unknown Problem"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6 border-b border-border/40 text-[10px] font-bold text-muted-foreground/70">
                      {formatDistanceToNow(new Date(sol.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </QueryGuard>

        {/* Pagination Controls - Outside QueryGuard to remain visible during loading */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/10">
          {(totalCount > 0 || isLoading) && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {isLoading ? (
                <span className="opacity-40 animate-pulse">Loading Solutions...</span>
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
                    onClick={() => {
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
                          isActive={currentPage === page}
                          onClick={() => {
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
                    onClick={() => {
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
    </div>
  );
};
