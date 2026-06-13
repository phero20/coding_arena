"use client";


import { Terminal } from "lucide-react";

import { ErrorDisplay, EmptyDisplay } from "@/components/shared/StatusState";
import { DynamicEditor as Editor } from "@/components/workspace-shared/editor/DynamicEditor";
import { useEditorStore } from "@/store/use-editor-store";
import { useMonacoConfig } from "@/hooks/workspace/use-monaco-config";
import type { TrackExerciseResponse, ExerciseRunResult } from "@/types/academy";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestCaseField } from "@/components/workspace-shared/ui/TestCaseField";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AcademyResultSkeleton } from "@/components/skeletons/AcademySkeletons";

export interface AcademyConsolePanelProps {
  exercise: TrackExerciseResponse;
  trackSlug: string;
  activeTab: "testcase" | "result";
  runResult: ExerciseRunResult | null;
  isExecutionRunning?: boolean;
  runError?: Error | string | null;
}

export const AcademyConsolePanel: React.FC<AcademyConsolePanelProps> = ({
  exercise,
  trackSlug,
  activeTab,
  runResult,
  isExecutionRunning,
  runError,
}) => {
  const preferences = useEditorStore((state) => state.preferences);
  const monacoOptions = useMonacoConfig(preferences);



  return (
    <div className="flex flex-col h-full border-t border-border/20 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col min-h-0">
        
        {activeTab === "testcase" && (
          <div className="h-full flex flex-col space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/90">
              <Terminal className="size-4 text-primary" />
              Test Suite
            </h3>
            
            {exercise.test_code ? (
              <div className="flex-1 rounded-md overflow-hidden border border-border/40">
                <Editor
                  height="100%"
                  language={trackSlug}
                  theme="vs-dark"
                  value={exercise.test_code}
                  options={{
                    ...monacoOptions,
                    readOnly: true,
                    minimap: { enabled: false },
                    lineNumbers: "on",
                  }}
                />
              </div>
            ) : (
              <EmptyDisplay
                icon={Terminal}
                title="No Test Code"
                message="This exercise does not provide a test suite."
                className="h-full"
              />
            )}
          </div>
        )}

        {activeTab === "result" && (
          <div className="h-full flex flex-col space-y-4">
             {!isExecutionRunning && runError && (
              <ErrorDisplay
                title="Execution Error"
                message={
                  typeof runError === "string"
                    ? runError
                    : (runError as Error)?.message ||
                      "An unexpected error occurred during execution."
                }
                className="h-full border-none shadow-none bg-transparent"
              />
            )}

            {!runError && !isExecutionRunning && !runResult && (
              <EmptyDisplay
                icon={Terminal}
                title="Ready to Run"
                message="Click Run to compile and execute your solution against the test suite."
                className="h-full"
              />
            )}

            {isExecutionRunning && (
              <AcademyResultSkeleton />
            )}

            {!isExecutionRunning && runResult && (
              <div className="flex flex-col space-y-4 pb-10">
                {/* Compilation Error Banner */}
                {runResult.compileError && (
                  <TestCaseField
                    label="Compilation Error"
                    value={runResult.compileError}
                    isOutput
                    isError
                  />
                )}

                {/* Test Runner View */}
                <div className="flex flex-col space-y-6 mt-2">
                  {/* Summary Header */}
                  {!runResult.compileError && (
                    <Card className={cn(
                      "border shadow-sm",
                      runResult.passed 
                        ? "bg-status-accepted/10 border-status-accepted/20"
                        : "bg-status-runtime-error/10 border-status-runtime-error/20"
                    )}>
                      <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
                        {runResult.passed ? <CheckCircle2 className="size-6 text-status-accepted" /> : <XCircle className="size-6 text-status-runtime-error" />}
                        <div>
                          <CardTitle className={cn("text-sm tracking-wide uppercase", runResult.passed ? "text-status-accepted" : "text-status-runtime-error")}>
                            {runResult.passed ? "ALL TESTS PASSED" : "TESTS FAILED"}
                          </CardTitle>
                          <CardDescription className={cn("mt-0.5", runResult.passed ? "text-status-accepted/80" : "text-status-runtime-error/80")}>
                            {runResult.passedTests} / {runResult.totalTests} tests passing
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  )}

                  {/* Failed Tests List */}
                  {runResult.failures && runResult.failures.length > 0 && (
                    <div className="flex flex-col space-y-6">
                      {runResult.failures.map((f: any, i: number) => (
                        <div key={i} className="flex flex-col space-y-4 border-b border-border/20 pb-6 last:border-0">
                          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-status-runtime-error">
                            <XCircle className="size-3.5" /> {f.name}
                          </span>
                          <TestCaseField label="Message" value={f.message} isError />
                          {f.output && <TestCaseField label="Output" value={f.output} isOutput />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
