"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Terminal, AlertCircle, RefreshCw } from "lucide-react";
import type { ProblemTest } from "@/types/api";
import { cn } from "@/lib/utils";
import { TestCaseField } from "./TestCaseField";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import type { RunSubmissionResponse } from "@/services/submission.service";
import { Badge } from "../ui/badge";

interface ConsolePanelProps {
  tests: ProblemTest | null;
  isLoading: boolean;
  error: Error | null;
  /** Which sub-tab to open by default. Defaults to "testcase". */
  initialTab?: "testcase" | "result";
  /** Optional latest run result to display in the Result tab. */
  runResult?: RunSubmissionResponse | null;
  /** Whether a run submission is currently loading. */
  runResultLoading?: boolean;
  /** Optional error from the run submission API. */
  runError?: Error | null;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  tests,
  isLoading,
  error,
  initialTab = "testcase",
  runResult,
  runResultLoading,
  runError,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Reset result index when new results arrive
  React.useEffect(() => {
    setActiveResultIndex(0);
  }, [runResult]);

  const cases = useMemo(() => tests?.cases ?? [], [tests]);
  const activeCase = cases[activeIndex] ?? null;
  const activeResult = useMemo(
    () => runResult?.tests[activeResultIndex] ?? null,
    [runResult, activeResultIndex],
  );

  return (
    <div className="flex flex-col h-full  border-t border-border/20 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Tabs defaultValue="testcase" value={activeTab} className="h-full">
          <TabsContent value="testcase" className="mt-0 h-full space-y-4">
            {isLoading && (
              <div className="h-full flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                  <Terminal className="size-8 text-muted-foreground/40" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Loading test cases...
                  </p>
                </div>
              </div>
            )}

            {!isLoading && error && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                  <AlertCircle className="size-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    Failed to load tests
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                    {error.message}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !error && cases.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 opacity-50">
                <Terminal className="size-10 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground">
                  No public test cases available for this problem.
                </p>
              </div>
            )}

            {!isLoading && !error && cases.length > 0 && activeCase && (
              <div className="space-y-6">
                <ButtonGroup className="flex flex-wrap">
                  {cases.map((tc, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider border transition-all duration-300",
                        idx === activeIndex
                          ? "bg-primary/10 border-primary/50 text-foreground ring-1 ring-primary/20 hover:bg-primary/20"
                          : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/20 hover:border-border/60",
                      )}
                    >
                      Case {idx + 1}
                    </Button>
                  ))}
                </ButtonGroup>

                <div className="space-y-5">
                  <TestCaseField label="Input" value={activeCase.input} />
                  <TestCaseField
                    label="Expected Output"
                    value={activeCase.expected_output}
                    isOutput
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="result" className="mt-0 h-full space-y-4">
            {runError && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 ">
                <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 relative shadow-2xl shadow-destructive/5 drop-shadow-xl">
                  <AlertCircle className="size-8 text-destructive animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl bg-destructive/5 blur-xl -z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                    Execution Error
                  </h3>
                  <div className="max-w-[320px] p-3 rounded-lg bg-destructive/5 border border-destructive/20 backdrop-blur-md">
                    <p className="text-[11px] text-destructive leading-relaxed wrap-break-word">
                      {runError.message ||
                        "An unexpected server error occurred while running your code."}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                    Please check your connection or try again later.
                  </p>
                </div>
              </div>
            )}

            {!runError && runResultLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="size-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 relative">
                  <RefreshCw className="size-6 text-primary/40 animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-foreground">
                    Executing Code...
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                    Running your solution against the selected test cases.
                  </p>
                </div>
              </div>
            )}

            {!runError && !runResultLoading && !runResult && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="size-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 relative">
                  <Terminal className="size-6 text-primary/40" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-foreground">
                    No Results Yet
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                    Write your code and click the{" "}
                    <span className="text-primary font-bold">Run</span> button
                    to execute the required test cases.
                  </p>
                </div>
              </div>
            )}

            {!runError && !runResultLoading && runResult && (
              <div className="h-full flex flex-col gap-6 py-4">
                {/* Overall status header */}
                <div className=" flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Overall Status:
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border",
                        runResult.overallStatus === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                          : "bg-destructive/10 text-destructive border-destructive/40",
                      )}
                    >
                      {runResult.overallStatus}
                    </Badge>
                  </div>
                </div>

                {/* Tabbed Case Selector - Exactly like Tests tab */}
                <div className="space-y-6 flex-1 flex flex-col min-h-0">
                  <ButtonGroup className="flex flex-wrap shrink-0">
                    {runResult.tests.map((t, idx) => (
                      <Button
                        key={t.index}
                        type="button"
                        onClick={() => setActiveResultIndex(idx)}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider border transition-all duration-300 relative overflow-hidden",
                          idx === activeResultIndex
                            ? "bg-primary/10 border-primary/50 text-foreground ring-1 ring-primary/20 hover:bg-primary/20"
                            : "bg-muted/10 border-border/40 text-muted-foreground hover:bg-muted/20 hover:border-border/60",
                        )}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Case {idx + 1}
                          <div
                            className={cn(
                              "size-1.5 rounded-full shrink-0",
                              t.status === "ACCEPTED"
                                ? "bg-emerald-500"
                                : "bg-destructive",
                            )}
                          />
                        </span>
                      </Button>
                    ))}
                  </ButtonGroup>

                  {/* Active Case Details */}
                  {activeResult && (
                    <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Result Details
                        </span>
                        <Badge
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                            activeResult.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                              : "bg-destructive/10 text-destructive border-destructive/40",
                          )}
                        >
                          {activeResult.status}
                        </Badge>
                      </div>

                      <TestCaseField label="Input" value={activeResult.input} />
                      <TestCaseField
                        label={
                          activeTab === "testcase"
                            ? "Expected Output"
                            : "Output"
                        }
                        value={activeResult.expected_output}
                        isOutput
                      />
                      {activeResult.stdout !== null && (
                        <TestCaseField
                          label="Your Output"
                          value={activeResult.stdout ?? ""}
                          isOutput
                        />
                      )}
                      {activeResult.compile_output && (
                        <TestCaseField
                          label="Compiler Output"
                          value={activeResult.compile_output ?? ""}
                          isOutput
                        />
                      )}
                      {activeResult.message && !activeResult.compile_output && (
                        <TestCaseField
                          label="Message"
                          value={activeResult.message ?? ""}
                          isOutput
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
