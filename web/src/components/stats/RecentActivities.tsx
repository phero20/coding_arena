"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useProfileStore } from "@/store/use-profile-store";
import { useActivityPagination } from "@/hooks/stats/use-activity-pagination";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { RecentActivitiesSkeleton } from "../skeletons";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Code2, 
  ChevronRight,

} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodeViewer } from "@/components/ui/code-viewer";
import { Button } from "../ui/button";

interface RecentActivitiesProps {
  username?: string;
  className?: string;
  redirectOnLoadMore?: boolean;
  hideHeader?: boolean;
}

export function RecentActivities({ 
  username, 
  className,
  redirectOnLoadMore,
  hideHeader
}: RecentActivitiesProps) {
  const { setActiveTab, setArenaTab } = useProfileStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const { 
    activities, 
    isLoading, 
    isFetching,
    isError, 
    error,
    refetch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  } = useActivityPagination(username, 10);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLoadMoreRedirect = () => {
    setActiveTab("submissions");
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "submissions");
    router.push(`${pathname}?${params.toString()}`);
  };

  const expectedCount = totalCount > 0 
    ? Math.min(10, totalCount - (currentPage - 1) * 10)
    : 10;

  return (
    <Card
      className={cn("overflow-hidden border border-border/40 bg-card/60", className)}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-border/50 p-4 py-5">
          <div className="flex items-center gap-2">
            <Code2 size={14} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-widest">
              Recent Activity
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalCount} TOTAL{" "}
              <span className="hidden sm:block">SOLUTIONS</span>
            </Badge>
          </div>
        </div>
      )}

      <QueryGuard
        loading={isLoading || (isFetching && activities.length === 0)}
        error={isError ? error : null}
        data={activities}
        onRetry={refetch}
        skeleton={<RecentActivitiesSkeleton count={expectedCount} />}
        emptyTitle="No submissions yet"
        emptyMessage={
          username
            ? "This user hasn't submitted any code yet."
            : "You haven't submitted any code yet. Start solving problems to see your activity here!"
        }
        emptyIcon={Code2}
      >
        {(activityList) => (
          <div className="border-t border-border/40 bg-card/50">
            <Table className="table-fixed border-separate border-spacing-0">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-b border-border/10">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-4 md:pl-6 w-[100px] sm:w-[160px] text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-2 text-muted-foreground">
                    Problem
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-4 md:pr-6 w-[80px] sm:w-[140px] text-muted-foreground">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityList.map((submission, idx) => {
                  const subId = submission.id || idx.toString();
                  const isExpanded = expandedId === subId;

                  return (
                    <React.Fragment key={subId}>
                      <TableRow
                        className={cn(
                          "group cursor-pointer transition-colors hover:bg-muted/30",
                          isExpanded && "bg-muted/50",
                        )}
                        onClick={() => toggleExpand(subId)}
                      >
                        <TableCell
                          className={cn(
                            "py-4 pl-2 md:pl-4 border-b transition-colors",
                            isExpanded
                              ? "border-primary/20"
                              : "border-border/40",
                          )}
                        >
                          <VerdictBadge
                            verdict={submission.status}
                            className="text-[10px]"
                          />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "py-4 pl-2 border-b transition-colors",
                            isExpanded
                              ? "border-primary/20"
                              : "border-border/40",
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-xs tracking-tight truncate text-foreground/90 uppercase group-hover:text-primary transition-colors">
                              {submission.problemTitle ??
                                submission.problemId}
                            </span>
                            <Badge
                              variant="secondary"
                              className="uppercase text-[10px] px-2 hidden sm:inline-flex"
                            >
                              {submission.formattedLang}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "py-4 text-right pr-2 md:pr-6 border-b transition-colors text-[10px] font-bold text-muted-foreground/70",
                            isExpanded
                              ? "border-primary/20"
                              : "border-border/40",
                          )}
                        >
                          {submission.timeAgo}
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20 border-none">
                          <TableCell colSpan={3} className="p-0 border-none">
                            <div className="animate-in slide-in-from-top-2 duration-300">
                              <CodeViewer
                                code={submission.sourceCode}
                                language={submission.languageId}
                                label={submission.formattedLang}
                                showHeader={true}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryGuard>

      {/* Pagination Controls - Outside QueryGuard to remain visible during loading */}
      <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border-t border-border/40">
        {(totalCount > 0 || isLoading) && (
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            {isLoading ? (
              <span className="opacity-40 animate-pulse">Loading Activity Data...</span>
            ) : (
              <>
                Showing{" "}
                <span className="text-muted-foreground/60">
                  {(currentPage - 1) * 10 + 1}-
                  {Math.min(currentPage * 10, totalCount)}
                </span>{" "}
                of{" "}
                <span className="text-muted-foreground/60">{totalCount}</span>
              </>
            )}
          </div>
        )}

        {redirectOnLoadMore ? (
          <Button
            onClick={handleLoadMoreRedirect}
            disabled={isLoading}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            View all submissions
            <ChevronRight size={12} />
          </Button>
        ) : (
          (totalPages > 1 || isLoading) && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={cn(
                      currentPage === 1 && "pointer-events-none opacity-50",
                    )}
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
                          isActive={page === currentPage}
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
                      if (currentPage < totalPages)
                        setCurrentPage((p) => p + 1);
                    }}
                    className={cn(
                      currentPage === totalPages &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )
        )}
      </div>
    </Card>
  );
}
