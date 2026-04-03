"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
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
import { SubmissionSkeleton } from "@/components/shared/Skeletons";
import { EmptyDisplay } from "@/components/shared/StatusState";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Submission } from "@/services/submission.service";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";

interface SubmissionHistoryProps {
  submissions: Submission[];
  isLoading: boolean;
  error: any;
}

const statusMap: Record<
  string,
  {
    icon: any;
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
    textClass: string;
  }
> = {
  ACCEPTED: {
    icon: CheckCircle2,
    variant: "outline",
    label: "Accepted",
    textClass: "text-emerald-500",
  },
  WRONG_ANSWER: {
    icon: XCircle,
    variant: "destructive",
    label: "Wrong Answer",
    textClass: "text-destructive",
  },
  TLE: {
    icon: Clock,
    variant: "outline",
    label: "TLE",
    textClass: "text-amber-500",
  },
  RUNTIME_ERROR: {
    icon: AlertCircle,
    variant: "secondary",
    label: "Runtime Error",
    textClass: "text-orange-500",
  },
  SYSTEM_ERROR: {
    icon: AlertCircle,
    variant: "secondary",
    label: "System Error",
    textClass: "text-muted-foreground",
  },
  PENDING: {
    icon: Activity,
    variant: "outline",
    label: "Pending",
    textClass: "text-primary",
  },
  RUNNING: {
    icon: Activity,
    variant: "outline",
    label: "Running",
    textClass: "text-primary",
  },
};

const languageMap: Record<string, string> = {
  "63": "JavaScript",
  "71": "Python",
  "62": "Java",
  "54": "C++",
};

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  submissions,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return <SubmissionSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <AlertCircle className="mb-2 size-8 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-tighter">
          Failed to load history
        </p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyDisplay
        title="Empty History"
        message="You haven't submitted any solutions yet. Your journey starts with a single Run!"
      />
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <Accordion type="single" collapsible className="w-full space-y-3">
        {submissions.map((sub, idx) => {
          const status = statusMap[sub.status] || statusMap.SYSTEM_ERROR;
          const StatusIcon = status.icon;

          // Extremely safe property access for legacy data
          const rawLangId = sub.languageId || (sub as any).language_id;
          const langLabel = languageMap[String(rawLangId)] || String(rawLangId || "Unknown");
          const syntaxLang = (languageMap[String(rawLangId)] || String(rawLangId || "javascript")).toLowerCase();
          const sourceCode = sub.sourceCode || (sub as any).source_code || "";

          return (
            <AccordionItem
              key={sub.id || idx}
              value={sub.id || idx.toString()}
              className="border border-border/40 bg-muted/20 rounded-lg px-1 overflow-hidden transition-all data-[state=open]:border-primary/40 hover:border-primary/20"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex w-full items-center justify-between pr-2">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md border border-border/20 bg-background/50",
                        status.textClass,
                      )}
                    >
                      <StatusIcon className="size-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-bold tracking-tight",
                            status.textClass,
                          )}
                        >
                          {status.label}
                        </span>
                        <Badge
                          variant="outline"
                          className="h-4 px-1 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/70"
                        >
                          {langLabel}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground/50">
                        {sub.createdAt ? formatDistanceToNow(new Date(sub.createdAt), {
                          addSuffix: true,
                        }) : "Recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.time !== undefined && (
                      <div className="flex items-center gap-1 text-[10px]  text-muted-foreground/40">
                        <Zap className="size-3" />
                        <span>{sub.time}s</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-border/10 bg-muted/5 p-0">
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
  );
};
