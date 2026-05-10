"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Terminal, AlertCircle, RefreshCw } from "lucide-react";
import { ConsoleSkeleton } from "@/components/shared/Skeletons";
import { EmptyDisplay } from "@/components/shared/StatusState";
import { cn } from "@/lib/utils";
import { TestCaseField } from "./TestCaseField";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import type { ConsolePanelProps } from "@/types/component.types";
import { useConsoleViewState } from "@/hooks/workspace/use-console-view-state";

export const ConsolePanel: React.FC<ConsolePanelProps> = (props) => {
  const {
    activeTab,
    setActiveTab,
    activeIndex,
    setActiveIndex,
    activeResultIndex,
    setActiveResultIndex,
    cases,
    activeCase,
    effectiveTestResults,
    hasTestResults,
    isTabLoading,
    showResultsSection,
    isForbiddenError,
    activeResult,
    currentStatus,
  } = useConsoleViewState(props);

  const { isLoading, error, runError, hasSubmitted, verdict, runResult } = props;

  return (
    <div className="flex flex-col h-full border-t border-border/20 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Tabs
          defaultValue="testcase"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="h-full overflow-hidden"
        >
          <TabsContent value="testcase" className="mt-0 h-full space-y-4">
            {isLoading && <ConsoleSkeleton />}

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
              <EmptyDisplay
                title="No Public Tests"
                message="This problem does not provide public test cases."
              />
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

          <TabsContent
            value="result"
            className="mt-0 h-full space-y-4 overflow-hidden flex flex-col"
          >
            {runError && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 overflow-y-auto">
                <div className={cn(
                  "size-16 rounded-2xl flex items-center justify-center border relative shadow-2xl drop-shadow-xl",
                  isForbiddenError 
                    ? "bg-primary/10 border-primary/20 shadow-primary/5" 
                    : "bg-destructive/10 border-destructive/20 shadow-destructive/5"
                )}>
                  {isForbiddenError ? (
                    <RefreshCw className="size-8 text-primary animate-spin-slow" />
                  ) : (
                    <AlertCircle className="size-8 text-destructive animate-pulse" />
                  )}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl blur-xl -z-10",
                    isForbiddenError ? "bg-primary/5" : "bg-destructive/5"
                  )} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                    {isForbiddenError ? "Battle Concluded" : "Execution Error"}
                  </h3>
                  <div className={cn(
                    "max-w-[320px] p-3 rounded-lg border backdrop-blur-md",
                    isForbiddenError 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-destructive/5 border-destructive/20"
                  )}>
                    <p className={cn(
                      "text-[11px] leading-relaxed wrap-break-word font-bold tracking-tight",
                      isForbiddenError ? "text-primary/90" : "text-destructive"
                    )}>
                      {isForbiddenError 
                        ? "Your final submission has already been recorded for this match. The sector is now locked."
                        : (typeof runError === "string" 
                            ? runError 
                            : (runError as Error)?.message || "An unexpected server error occurred.")}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                    {isForbiddenError 
                      ? "Check the leaderboard for final standings."
                      : "Please check your connection or try again later."}
                  </p>
                </div>
              </div>
            )}

            {/* 1. Loading State */}
            {!runError && isTabLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 overflow-y-auto">
                <div className="size-14 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 relative">
                  <RefreshCw className="size-6 text-primary/40 animate-spin" />
                  <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl -z-10 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-black uppercase tracking-widest text-foreground animate-pulse">
                    Executing Code...
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed mx-auto font-medium">
                    {currentStatus === "PENDING" || verdict === "PENDING" ? "Evaluating your submission against all test cases." : "Running your solution against the selected test cases."}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Empty State (Fallback if not loading and no results) */}
            {!runError && !isTabLoading && !showResultsSection && (
              <EmptyDisplay
                icon={hasSubmitted ? RefreshCw : Terminal}
                title={hasSubmitted ? "Submission Finalized" : "No Results Yet"}
                message={hasSubmitted 
                  ? "Your performance has been logged. Results are synced across the arena." 
                  : "Write your code and click the Run or Submit button to see simulation results."}
                className="h-full"
              />
            )}

            {/* 3. Results Section */}
            {showResultsSection && (
              <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-4 min-h-0">
                {/* Overall status header */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Overall Status:
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border",
                        (verdict || runResult?.overallStatus) === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                          : "bg-destructive/10 text-destructive border-destructive/40",
                      )}
                    >
                      {verdict || runResult?.overallStatus || "PENDING"}
                    </Badge>
                  </div>
                </div>

                {/* Tabbed Case Selector - Exactly like Tests tab */}
                <div className="space-y-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
                  <ButtonGroup className="flex flex-wrap shrink-0">
                    {effectiveTestResults.map((t, idx) => (
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
