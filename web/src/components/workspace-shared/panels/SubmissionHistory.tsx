"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import type { SubmissionHistoryProps } from "@/types/component.types";
import { Code2, Terminal, X, PenLine, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionSkeleton } from "@/components/shared/Skeletons";
import { EmptyDisplay } from "@/components/shared/StatusState";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExecutionVerdict, Submission } from "@/types/submission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodeViewer } from "@/components/ui/code-viewer";
import { VerdictBadge } from "@/components/ui/verdict-badge";

const languageMap: Record<string, string> = {
  "63": "JavaScript",
  "71": "Python",
  "62": "Java",
  "54": "C++",
};

import { QueryGuard } from "@/components/shared/QueryGuard";

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  submissions,
  isLoading,
  error,
  onRetry,
}) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={submissions}
      skeleton={<SubmissionSkeleton />}
      emptyTitle="No Submissions"
      emptyMessage="No submission history found. Your evaluated results will be listed here."
      emptyIcon={Terminal}
      onRetry={onRetry}
    >
      {(submissionList) => (
        <div className="">
          <Table className="table-fixed border-separate border-spacing-0">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b border-border/10">
                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-[160px] text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
                  Language
                </TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[100px] sm:w-[140px] text-muted-foreground">
                  Submitted
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissionList.map((sub, idx) => {
                const subId = sub.id || idx.toString();
                const isExpanded = expandedId === subId;
                const status = (sub.status || "SYSTEM_ERROR") as
                  | ExecutionVerdict
                  | "PENDING"
                  | "RUNNING";

                // Extremely safe property access for legacy data
                const rawLangId = sub.languageId || (sub as any).language_id;
                const langLabel =
                  languageMap[String(rawLangId)] ||
                  String(rawLangId || "Unknown");
                const syntaxLang = (
                  languageMap[String(rawLangId)] ||
                  String(rawLangId || "javascript")
                ).toLowerCase();
                const sourceCode =
                  sub.sourceCode || (sub as any).source_code || "";

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
                          "py-4 pl-6 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/40",
                        )}
                      >
                        <VerdictBadge
                          verdict={status}
                          className="text-[10px]"
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-4 pl-0 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/40",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="uppercase">
                            {langLabel}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-4 text-right pr-6 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/40",
                        )}
                      >
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground/70 whitespace-nowrap">
                            {sub.createdAt
                              ? formatDistanceToNow(new Date(sub.createdAt), {
                                  addSuffix: true,
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-muted/40 hover:bg-muted/40 border-none">
                        <TableCell colSpan={3} className="p-0 border-none">
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            <CodeViewer
                              code={sourceCode}
                              language={syntaxLang}
                              label={`${langLabel}`}
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
  );
};
