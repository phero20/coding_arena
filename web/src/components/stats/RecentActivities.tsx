import React from "react";
import {
  TrendingUp,
  Code2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { RecentActivitiesSkeleton } from "../shared/Skeletons";
import { VerdictBadge } from "../ui/verdict-badge";
import { useProfileStore } from "@/store/use-profile-store";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useActivityPagination } from "@/hooks/stats/use-activity-pagination";
import { Card } from "../ui/card";
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
            : "No submissions yet. Start solving!"
        }
        emptyIcon={Code2}
      >
        {(activityList) => (
          <>
            <div className="overflow-hidden border border-border/40 bg-card/50">
              <Table className="table-fixed border-separate border-spacing-0 w-full">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b border-border/10">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest pl-3 w-[140px] text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
                      Problem
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[100px] text-muted-foreground">
                      Submitted
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityList.map((submission) => {
                    const subId = submission.id;
                    const isExpanded = expandedId === subId;

                    return (
                      <React.Fragment key={subId}>
                        <TableRow
                          className={cn(
                            "group cursor-pointer transition-colors border-b border-border/5",
                            isExpanded && "bg-muted/50",
                          )}
                          onClick={() => toggleExpand(subId)}
                        >
                          <TableCell
                            className={cn(
                              "py-4 pl-3 border-b transition-colors",
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
                              "py-4 pl-0 border-b transition-colors",
                              isExpanded
                                ? "border-primary/20"
                                : "border-border/40",
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-xs tracking-tight truncate text-foreground/90 uppercase">
                                {submission.problemTitle ??
                                  submission.problemId}
                              </span>
                              <Badge
                                variant="secondary"
                               className="uppercase"
                              >
                                {submission.formattedLang}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell
                            className={cn(
                              "py-4 text-right pr-6 border-b transition-colors text-[10px] font-bold text-muted-foreground/70",
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

            {/* Pagination Controls */}
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60">
              {totalCount > 0 && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Showing{" "}
                  <span className="text-muted-foreground/60">
                    {(currentPage - 1) * 10 + 1}-
                    {Math.min(currentPage * 10, totalCount)}
                  </span>{" "}
                  of{" "}
                  <span className="text-muted-foreground/60">{totalCount}</span>
                </div>
              )}

              {redirectOnLoadMore ? (
                <Button
                  onClick={handleLoadMoreRedirect}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  View all submissions
                  <ChevronRight size={12} />
                </Button>
              ) : (
                totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage((p) => p - 1);
                          }}
                          className={cn(
                            currentPage === 1 &&
                              "pointer-events-none opacity-50",
                          )}
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Basic sliding window for many pages
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
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
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
          </>
        )}
      </QueryGuard>
    </Card>
  );
}
