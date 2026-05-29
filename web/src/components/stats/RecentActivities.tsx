<<<<<<< HEAD
import React from "react";
import {
  ChevronRight,
  Loader2,
  Code2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { useActivityFeed } from "@/hooks/stats/use-activity-feed";
import { RecentActivitiesSkeleton } from "../shared/Skeletons";
import { VerdictBadge } from "../ui/verdict-badge";
=======
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
  ChevronLeft,
  RefreshCw,
  Terminal,
  Activity
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
>>>>>>> prod-deploy

interface RecentActivitiesProps {
  username?: string;
  className?: string;
<<<<<<< HEAD
}

/**
 * RecentActivities: Live accordion-based submission feed.
 * Powered by useActivityFeed hook — mirrors MatchResults design language.
 */
export function RecentActivities({ username, className }: RecentActivitiesProps) {
  const { 
    activities, 
    isLoading, 
    isError, 
    error,
    loadMore, 
    hasMore,
    isFetchingMore,
    totalCount,
    refetch
  } = useActivityFeed(username, 10);

  return (
    <div className={cn("p-6 border border-border/50 bg-card rounded-xl space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-difficulty-easy" />
          <span className="text-xs font-bold uppercase tracking-wider">Recent Submissions</span>
        </div>
      </div>

      <QueryGuard
        loading={isLoading}
        error={isError ? error : null}
        data={activities}
        onRetry={refetch}
        skeleton={<RecentActivitiesSkeleton count={5} />}
        emptyTitle="No submissions yet"
        emptyMessage={username ? "This user hasn't submitted any code yet." : "No submissions yet. Start solving!"}
        emptyIcon={Code2}
      >
        {(activityList) => (
          <>
            <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
              <Accordion type="single" collapsible className="w-full space-y-3">
                {activityList.map((submission) => {
                  return (
                    <AccordionItem
                      key={submission.id}
                      value={submission.id}
                      className="border border-border/40 bg-muted/20 rounded-lg overflow-hidden transition-all data-[state=open]:border-primary"
                    >
                      <AccordionTrigger className="w-full pl-3 pr-6 py-3 hover:no-underline [&>svg]:hidden group relative">
                        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[220px_90px_90px_1fr_auto] items-center gap-2 sm:gap-4 w-full text-left">
                          <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-xs sm:text-sm font-bold tracking-tight truncate">
                              {submission.problemTitle ?? submission.problemId}
                            </span>
                            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter mt-1">
                              {submission.timeAgo}
                            </p>
                          </div>

                          <div className="hidden sm:flex items-center justify-center shrink-0 w-[90px]">
                            <Badge className="uppercase">
                              {submission.formattedLang}
                            </Badge>
                          </div>

                          {submission.time != null && (
                            <div className="hidden sm:flex items-center justify-center shrink-0 w-[90px] gap-1 text-muted-foreground/60">
                              <Timer size={11} />
                              <span className="text-[10px] font-medium">{submission.time} ms</span>
                            </div>
                          )}

                          {/* Spacer to push verdict to the right */}
                          <div className="hidden sm:block flex-1" />

                          <div className="flex justify-end">
                            <VerdictBadge verdict={submission.status} />
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="border-t border-border bg-muted p-0">
                        {submission.sourceCode ? (
                          <SyntaxHighlighter
                            language={submission.languageId?.toLowerCase() || "javascript"}
                            style={vscDarkPlus}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: "1.5rem",
                              fontSize: "0.75rem",
                              lineHeight: "1.8",
                              background: "transparent",
                              overflowX: "hidden",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                            }}
                            codeTagProps={{
                              style: {
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                                display: "block",
                                maxWidth: "100%",
                              },
                            }}
                          >
                            {submission.sourceCode}
                          </SyntaxHighlighter>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                            <Code2 className="size-8 mb-2" />
                            <p className="text-[10px] font-black uppercase italic">Code not available</p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            {/* Pagination Metadata & Load More Button */}
            <div className="space-y-3 pt-2">
              {hasMore && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => loadMore()}
                  disabled={isFetchingMore}
                  className=""
                >
                  {isFetchingMore ? (
                    <Loader2 size={12} className="animate-spin mr-2" />
                  ) : (
                    <ChevronRight size={12} className="rotate-90 mr-2" />
                  )}
                  {isFetchingMore ? "Loading..." : "Load more submissions"}
                </Button>
              )}

              {totalCount > 0 && (
                <div className="flex items-center justify-end gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  <div className="flex items-center gap-1">
                    <span>Total Submissions:</span>
                    <span className="text-muted-foreground/60">{totalCount}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </QueryGuard>
    </div>
=======
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
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-[100px] sm:w-[160px] text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
                    Problem
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[80px] sm:w-[140px] text-muted-foreground">
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
                            <span className="font-bold text-xs tracking-tight truncate text-foreground/90 uppercase group-hover:text-primary transition-colors">
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
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
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
                          href="#"
                          isActive={page === currentPage}
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
>>>>>>> prod-deploy
  );
}
