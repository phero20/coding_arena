import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  Code2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecentSubmissionsQuery } from "@/hooks/queries/use-submission.queries";
import type { ExecutionVerdict } from "@/types/submission";
import { formatDistanceToNow } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface RecentActivitiesProps {
  username?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  ExecutionVerdict | "PENDING",
  { icon: React.ElementType; label: string; badgeClass: string }
> = {
  ACCEPTED:          { icon: CheckCircle2, label: "Accepted",       badgeClass: "bg-status-accepted text-status-accepted" },
  WRONG_ANSWER:      { icon: XCircle,      label: "Wrong Answer",   badgeClass: "bg-status-wrong-answer text-status-wrong-answer" },
  TLE:               { icon: Clock,        label: "Time Limit",     badgeClass: "bg-status-tle text-status-tle" },
  RUNTIME_ERROR:     { icon: AlertCircle,  label: "Runtime Error",  badgeClass: "bg-status-runtime-error text-status-runtime-error" },
  COMPILATION_ERROR: { icon: AlertCircle,  label: "Compile Error",  badgeClass: "bg-status-compile-error text-status-compile-error" },
  SYSTEM_ERROR:      { icon: AlertCircle,  label: "System Error",   badgeClass: "bg-status-system-error text-status-system-error" },
  PENDING:           { icon: Loader2,      label: "Pending",        badgeClass: "bg-status-pending text-status-pending" },
};

/**
 * RecentActivities: Live accordion-based submission feed.
 * Powered by /submissions/recent — mirrors MatchResults design language.
 */
export function RecentActivities({ username, className }: RecentActivitiesProps) {
  const { 
    data, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage,
    isFetchingNextPage
  } = useRecentSubmissionsQuery(10, username);

  const submissions = data?.pages.flatMap(page => page.submissions) ?? [];
  const latestPagination = data?.pages[data.pages.length - 1]?.pagination;

  return (
    <div className={cn("p-6 border border-border/50 bg-card rounded-xl space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-difficulty-easy" />
          <span className="text-xs font-bold uppercase tracking-wider">Recent Submissions</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs">Loading submissions...</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-10">
          <span className="text-xs text-destructive">Failed to load submissions.</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Code2 size={24} className="text-muted-foreground/30" />
          <span className="text-xs text-muted-foreground">
            {username ? "This warrior hasn't submitted any code yet." : "No submissions yet. Start solving!"}
          </span>
        </div>
      )}

      {/* Accordion Feed - Scrollable Container */}
      {submissions.length > 0 && (
        <div className="max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {submissions.map((submission) => {
              const status = (submission.status || "SYSTEM_ERROR") as ExecutionVerdict | "PENDING";
              const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["SYSTEM_ERROR"];
              const Icon = config.icon;
              const lang = submission.languageId
                ? submission.languageId.charAt(0).toUpperCase() + submission.languageId.slice(1)
                : "—";
              const timeAgo = submission.createdAt
                ? formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })
                : "—";

              return (
                <AccordionItem
                  key={submission.id}
                  value={submission.id}
                  className="border border-border/40 bg-muted/20 rounded-xl px-1 overflow-hidden transition-all data-[state=open]:border-primary/40 hover:border-primary/20"
                >
                  <AccordionTrigger className="w-full px-2 py-3 hover:no-underline [&>svg]:hidden group">
                    <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 sm:gap-4 w-full text-left">
                      <Icon
                        size={15}
                        className={cn(
                          "shrink-0",
                          status === "ACCEPTED"            && "text-status-accepted",
                          status === "WRONG_ANSWER"        && "text-status-wrong-answer",
                          status === "TLE"                 && "text-status-tle",
                          status === "RUNTIME_ERROR"       && "text-status-runtime-error",
                          status === "COMPILATION_ERROR"   && "text-status-compile-error",
                          status === "SYSTEM_ERROR"        && "text-status-system-error",
                          status === "PENDING"             && "text-status-pending animate-spin",
                        )}
                      />

                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="text-xs sm:text-sm font-bold tracking-tight truncate">
                          {submission.problemTitle ?? submission.problemId}
                        </span>
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter mt-0.5">
                          {timeAgo}
                        </p>
                      </div>

                      <div className="hidden sm:flex items-center justify-center shrink-0">
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-mono font-bold uppercase border-none bg-muted/80 text-muted-foreground"
                        >
                          {lang}
                        </Badge>
                      </div>

                      {submission.time != null && (
                        <div className="hidden sm:flex items-center gap-1 shrink-0 text-muted-foreground/60">
                          <Timer size={11} />
                          <span className="text-[10px] font-medium">{submission.time} ms</span>
                        </div>
                      )}

                      <div className="shrink-0">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-none whitespace-nowrap",
                            config.badgeClass,
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-t border-border/10 bg-muted/5 p-0">
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
      )}

      {/* Pagination Metadata & Load More Button */}
      {submissions.length > 0 && (
        <div className="space-y-3 pt-2">
          {hasNextPage && (
            <Button
              variant="default"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className=""
            >
              {isFetchingNextPage ? (
                <Loader2 size={12} className="animate-spin mr-2" />
              ) : (
                <ChevronRight size={12} className="rotate-90 mr-2" />
              )}
              {isFetchingNextPage ? "Loading..." : "Load more submissions"}
            </Button>
          )}

          {latestPagination && (
            <div className="flex items-center justify-end gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
              <div className="flex items-center gap-1">
                <span>Total Submissions:</span>
                <span className="text-muted-foreground/60">{latestPagination.total}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
