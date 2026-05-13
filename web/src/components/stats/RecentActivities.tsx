import React from "react";
import {
  ChevronRight,
  Loader2,
  Code2,
  Timer,
  Clock2,
  TrendingUp,
  ArrowRight
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

interface RecentActivitiesProps {
  username?: string;
  className?: string;
  redirectOnLoadMore?: boolean;
  hideHeader?: boolean;
}

/**
 * RecentActivities: Live accordion-based submission feed.
 * Powered by useActivityPagination hook.
 */
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
      className={cn(
        "p-6 shadow-none space-y-3",
        className,
      )}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Code2 size={14} className="text-difficulty-easy" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Recent Submissions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="p-2">
              {totalCount} TOTAL SUBMISSIONS
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
            <div
              className={cn(
                "overflow-y-auto custom-scrollbar transition-opacity duration-200"
              )}
            >
              {isFetching ? (
                <RecentActivitiesSkeleton count={expectedCount} />
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {activityList.map((submission) => {
                  return (
                    <AccordionItem
                      key={submission.id}
                      value={submission.id}
                      className="rounded-lg border border-border bg-card overflow-hidden transition-all data-[state=open]:border-primary"
                    >
                      <AccordionTrigger className="w-full pl-4 pr-4 sm:pl-6 sm:pr-6 py-4 hover:no-underline [&>svg]:hidden group relative">
                        <div className="flex items-center justify-between w-full gap-4">
                          {/* Submission Info Sector */}
                          <div className="flex-1 min-w-0 space-y-1 text-left">
                            <div className="flex items-center gap-4">
                              <h3 className="font-bold text-sm tracking-tight truncate text-foreground/90 uppercase">
                                {submission.problemTitle ??
                                  submission.problemId}
                              </h3>
                              <div className="hidden sm:flex items-center gap-2 shrink-0">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] uppercase font-bold tracking-tight"
                                >
                                  {submission.formattedLang}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 shrink-0">
                                <Clock2 className="h-3 w-3 opacity-60" />
                                {submission.timeAgo}
                              </span>
                            </div>
                          </div>

                          {/* Stats Sector */}
                          <div className="flex items-center gap-4 sm:gap-8 shrink-0 border-l border-border/10 pl-4 sm:pl-8">
                            <div className="flex flex-col items-center justify-center text-center">
                              <VerdictBadge verdict={submission.status} />
                            </div>

                            {/* <div className="hidden sm:flex flex-col items-center justify-center text-center">
                              <div className="flex items-center justify-center gap-1 text-[8px] font-black text-muted-foreground tracking-widest uppercase mb-1 opacity-70">
                                <Timer className="h-2.5 w-2.5" />
                                <span className="hidden sm:inline">
                                  RUNTIME
                                </span>
                              </div>
                              <span className="text-xs sm:text-sm font-black tabular-nums leading-none">
                                {submission.time ? `${submission.time}ms` : "—"}
                              </span>
                            </div> */}

                            <div className="flex flex-col items-center justify-center text-center">
                              <Button size="sm">
                                <Code2 className="w-3 h-3" />
                                <span className="hidden sm:inline">Code</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="border-t border-border bg-muted p-0">
                        {submission.sourceCode ? (
                          <SyntaxHighlighter
                            language={
                              submission.languageId?.toLowerCase() ||
                              "javascript"
                            }
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
                            <p className="text-[10px] font-black uppercase italic">
                              Code not available
                            </p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
                </Accordion>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
