"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Keyboard, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { TestCaseField } from "@/components/workspace-shared/TestCaseField";
=======
import { TestCaseField } from "@/components/workspace-shared";
>>>>>>> prod-deploy
import { ResultSkeleton } from "@/components/skeletons/WorkspaceSkeletons";
import type { CompilerExecuteResponse } from "@/types/compiler";

const TAB_CLS =
  "h-10 rounded-none px-3 text-[11px] font-black uppercase tracking-wide " +
  "border-b-2 border-transparent shrink-0 " +
  "data-[state=active]:bg-transparent data-[state=active]:text-primary " +
  "data-[state=active]:shadow-none data-[state=active]:border-primary transition-all";

interface Props {
  stdin: string;
  onStdinChange: (value: string) => void;
  result: CompilerExecuteResponse | null;
  isExecuting: boolean;
}

export const CompilerConsole: React.FC<Props> = ({
  stdin, onStdinChange, result, isExecuting,
}) => {
  // Default to stdin so users immediately understand how to provide input.
  // Auto-switch to output once a result arrives.
  const [activeTab, setActiveTab] = useState<"output" | "stdin">("stdin");

  useEffect(() => {
    if (result || isExecuting) setActiveTab("output");
  }, [result, isExecuting]);

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="flex flex-col h-full"
      >
        <header className="h-14 px-3 flex items-center border-b border-border/40 bg-card/10 backdrop-blur-sm shrink-0">
          <TabsList className="bg-transparent h-10 p-0 gap-0 ml-auto">
            <TabsTrigger value="stdin" className={TAB_CLS}>
              <Keyboard className="size-3 mr-1.5 shrink-0" />
              Input
            </TabsTrigger>
            <TabsTrigger value="output" className={TAB_CLS}>
              <Terminal className="size-3 mr-1.5 shrink-0" />
              Output
            </TabsTrigger>
          </TabsList>
        </header>

        <div className="flex-1 min-h-0">
          {/* ── Output Tab ── */}
          <TabsContent
            value="output"
            className="m-0 h-full p-6 overflow-auto custom-scrollbar space-y-4"
          >
            {isExecuting ? (
              <ResultSkeleton />
            ) : result ? (
              <div className="space-y-4 max-w-4xl">
                <div className="flex items-center gap-2">
                  <Terminal className="size-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Result
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-none whitespace-nowrap flex items-center gap-1 w-fit leading-none p-2",
                      result.exitCode === 0
                        ? "bg-status-accepted text-status-accepted"
                        : "bg-status-runtime-error text-status-runtime-error",
                    )}
                  >
                    {result.exitCode === 0 ? "Success" : "Failed"}
                  </Badge>
                </div>
                {stdin.trim() && (
                  <TestCaseField label="Input Provided" value={stdin.trim()} />
                )}
                {result.output && (
                  <TestCaseField
                    label="Output"
                    value={result.output}
                    isOutput
                  />
                )}
                {result.error && (
                  <TestCaseField label="Error" value={result.error} />
                )}
                {!result.output && !result.error && (
                  <Empty label="Program finished — no output" />
                )}
              </div>
            ) : (
              <Empty label="Output will appear here after you run your code" />
            )}
          </TabsContent>

          {/* ── Input Tab ── */}
          <TabsContent value="stdin" className="m-0 h-full flex flex-col overflow-hidden">
            {/* Instructions banner */}
            <div className="px-6 pt-5 pb-5 space-y-4 border-b border-border/20 shrink-0">
              <div className="flex items-center gap-2">
                <Keyboard className="size-4 text-primary shrink-0" />
                <p className="text-sm font-bold text-foreground">Program Input</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Does your program read input from the user? Type it here <span className="font-semibold text-foreground">before</span> clicking <span className="text-primary font-semibold">Run</span>. The text you write here will be passed directly to your program — just like typing in a terminal.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="size-3.5 shrink-0 mt-0.5 text-primary/70" />
                  <span>
                    <span className="font-semibold text-foreground">One value per line.</span>{" "}
                    Every time your code reads input — whether it's <code className="bg-muted/50 px-1 rounded font-mono">input()</code>, <code className="bg-muted/50 px-1 rounded font-mono">scanf()</code>, <code className="bg-muted/50 px-1 rounded font-mono">Scanner.nextLine()</code>, <code className="bg-muted/50 px-1 rounded font-mono">cin &gt;&gt;</code>, or <code className="bg-muted/50 px-1 rounded font-mono">readline()</code> — it reads the next line from here.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="size-3.5 shrink-0 mt-0.5 text-primary/70" />
                  <span>
                    <span className="font-semibold text-foreground">No input needed?</span>{" "}
                    Leave this box empty and just click Run — your program will execute without any input.
                  </span>
                </div>
              </div>
            </div>

            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder={"Enter your input here...\n\nExample:\n42\nhello world\n3.14"}
              spellCheck={false}
              className="flex-1 min-h-96 w-full p-6 bg-transparent font-mono text-xs resize-none focus:outline-none overflow-y-auto custom-scrollbar placeholder:text-muted-foreground/25"
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

const Empty = ({ label }: { label: string }) => (
  <div className="h-full flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground/30">
    <Terminal className="size-9" />
    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
  </div>
);
