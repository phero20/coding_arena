"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import type { SubmissionHistoryProps } from "@/types/component.types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Code2,
  AlertCircle,
  ChevronRight,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionSkeleton } from "@/components/shared/Skeletons";
import { EmptyDisplay } from "@/components/shared/StatusState";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExecutionVerdict, Submission } from "@/types/submission";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicHighlighter as SyntaxHighlighter } from "./DynamicHighlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";



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
  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={submissions}
      skeleton={<SubmissionSkeleton />}
      emptyTitle="Empty History"
      emptyMessage="You haven't submitted any solutions yet. Your journey starts with a single Run!"
      emptyIcon={Terminal}
      onRetry={onRetry}
    >
      {(submissionList) => (
        <Card className="border-none bg-transparent shadow-none">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {submissionList.map((sub, idx) => {
              const status = (sub.status || "SYSTEM_ERROR") as ExecutionVerdict | "PENDING" | "RUNNING";

              // Extremely safe property access for legacy data
              const rawLangId = sub.languageId || (sub as any).language_id;
              const langLabel = languageMap[String(rawLangId)] || String(rawLangId || "Unknown");
              const syntaxLang = (languageMap[String(rawLangId)] || String(rawLangId || "javascript")).toLowerCase();
              const sourceCode = sub.sourceCode || (sub as any).source_code || "";

              return (
                <AccordionItem
                  key={sub.id || idx}
                  value={sub.id || idx.toString()}
                  className="border bg-card rounded-lg px-1 overflow-hidden transition-all data-[state=open]:border-primary"
                >
                  <AccordionTrigger className="px-5 py-3 hover:no-underline [&>svg]:hidden group">
                    <div className="flex w-full items-center justify-between pr-2">
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <VerdictBadge verdict={status} />
                            <Badge className="uppercase text-xs">
                              {langLabel}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-medium text-muted-foreground/50 mt-2 uppercase">
                            {sub.createdAt
                              ? formatDistanceToNow(new Date(sub.createdAt), {
                                  addSuffix: true,
                                })
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.time !== undefined && (
                          <div className="flex items-center gap-1 text-[10px]  text-muted-foreground/40 mr-2 ">
                            <Zap className="size-3" />
                            <span>{sub.time}s</span>
                          </div>
                        )}
                        <Button size="sm">
                          <Code2 className="w-3 h-3" />
                          Code
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border bg-muted p-0">
                    <div className="relative">
                      <SyntaxHighlighter
                        language={syntaxLang}
                        style={vscDarkPlus}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: "1.2rem",
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
                        {sourceCode}
                      </SyntaxHighlighter>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
        })}
        </Accordion>
      </Card>
    )}
  </QueryGuard>
);
};
