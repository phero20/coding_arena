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

interface RecentActivitiesProps {
  username?: string;
  className?: string;
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
  );
}
