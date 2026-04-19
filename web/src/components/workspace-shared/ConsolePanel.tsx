"use client";

import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Terminal, AlertCircle, RefreshCw } from "lucide-react";
import { TestCaseSkeleton, ResultSkeleton } from "@/components/shared/Skeletons";
import { EmptyDisplay, ErrorDisplay } from "@/components/shared/StatusState";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { cn } from "@/lib/utils";
import { TestCaseField } from "./TestCaseField";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import type { ConsolePanelProps } from "@/types/component.types";
import { useConsoleViewState } from "@/hooks/workspace/use-console-view-state";
import { type ExecutionVerdict } from "@/types/submission";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { STATUS_CONFIG } from "@/domain/status";

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

  // Derive consolidated status config
  const overallVerdict = (verdict || runResult?.overallStatus || "PENDING") as ExecutionVerdict | "PENDING" | "RUNNING";

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
            <QueryGuard
              loading={isLoading}
              error={error}
              data={cases}
              skeleton={<TestCaseSkeleton />}
              emptyTitle="No Public Tests"
              emptyMessage="This problem does not provide public test cases."
            >
              {(testCases) => (
                <div className="space-y-6">
                  <ButtonGroup className="flex flex-wrap">
                    {testCases.map((tc, idx) => (
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
                    {activeCase && (
                      <>
                        <TestCaseField label="Input" value={activeCase.input} />
                        <TestCaseField
                          label="Expected Output"
                          value={activeCase.expected_output}
                          isOutput
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </QueryGuard>
          </TabsContent>

          <TabsContent
            value="result"
            className="mt-0 h-full space-y-4 overflow-hidden flex flex-col"
          >
            {runError && (
              <ErrorDisplay
                title={isForbiddenError ? "Match Concluded" : "Execution Error"}
                message={
                  isForbiddenError 
                    ? "Your final submission has been recorded. The simulation sector is now locked."
                    : (typeof runError === "string" 
                        ? runError 
                        : (runError as Error)?.message || "An unexpected simulation error occurred.")
                }
                className="h-full border-none shadow-none bg-transparent"
              />
            )}

            {/* 1. Loading State */}
            {!runError && isTabLoading && <ResultSkeleton />}

            {/* 2. Empty State (Fallback if not loading and no results) */}
            {!runError && !isTabLoading && !showResultsSection && (
              <EmptyDisplay
                icon={hasSubmitted ? RefreshCw : Terminal}
                title={hasSubmitted ? "Submission Finalized" : "Ready for Simulation"}
                message={hasSubmitted 
                  ? "Your performance has been logged. Results are synced across the arena." 
                  : "Click Run or Submit to initialize the match simulation."}
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
                    <VerdictBadge 
                      verdict={overallVerdict} 
                    />
                  </div>
                </div>

                {/* Tabbed Case Selector - Exactly like Tests tab */}
                <div className="space-y-6 flex flex-col flex-1 min-h-0 overflow-y-auto">
                  <ButtonGroup className="flex flex-wrap shrink-0">
                    {effectiveTestResults.map((t, idx) => {
                      const caseVerdict = (t.status || "SYSTEM_ERROR") as ExecutionVerdict | "PENDING" | "RUNNING";
                      const caseConfig = STATUS_CONFIG[caseVerdict] ?? STATUS_CONFIG.SYSTEM_ERROR;
                      
                      return (
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
                                caseVerdict === "RUNNING" ? "animate-spin" : "",
                                caseConfig.textColor.replace("text-", "bg-")
                              )}
                            />
                          </span>
                        </Button>
                      );
                    })}
                  </ButtonGroup>

                  {/* Active Case Details */}
                  {activeResult && (() => {
                    const activeResultVerdict = (activeResult.status || "SYSTEM_ERROR") as ExecutionVerdict | "PENDING" | "RUNNING";

                    return (
                      <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Result Details
                          </span>
                          <VerdictBadge 
                            verdict={activeResultVerdict} 
                          />
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
                  );
                  })()}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
