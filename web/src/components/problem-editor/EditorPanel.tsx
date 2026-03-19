"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { LanguageSelector } from "./LanguageSelector";
import { ConsolePanel } from "./ConsolePanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Problem } from "@/types/api";
import {
  RefreshCw,
  Code2,
  Terminal,
  CheckCircle2,
  WrapText,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useProblemEditor } from "@/hooks/use-problem-editor";
import { useProblemTests } from "@/hooks/use-problem-tests";
import { useEditorStore } from "@/store/use-editor-store";
import type { ExecutionVerdict } from "@/services/submission.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditorPanelProps {
  problem: Problem;
  runResult?:
    | import("@/services/submission.service").RunSubmissionResponse
    | null;
  isRunning?: boolean;
  runError?: Error | null;
  activeTab?: "code" | "testcase" | "result";
  onTabChange?: (tab: "code" | "testcase" | "result") => void;
  /** Current submission verdict (from polling) */
  verdict?: ExecutionVerdict | "PENDING" | null;
  /** Whether currently evaluating a submission */
  isEvaluating?: boolean;
  /** Test results from submission polling */
  pollingTests?:
    | import("@/services/submission.service").ExecutionTestResult[]
    | null;
}

/** Tab trigger style shared across Code / Test Cases / Result */
const TAB_CLS =
  "h-10 rounded-none px-3 text-[11px] font-black uppercase tracking-wide " +
  "border-b-2 border-transparent shrink-0 " +
  "data-[state=active]:bg-transparent data-[state=active]:text-primary " +
  "data-[state=active]:shadow-none data-[state=active]:border-primary transition-all";

export const EditorPanel: React.FC<EditorPanelProps> = ({
  problem,
  runResult,
  isRunning: isExecutionRunning,
  runError,
  activeTab: externalTab,
  onTabChange,
  verdict,
  isEvaluating,
  pollingTests,
}) => {
  const { theme } = useTheme();
  const {
    language,
    code,
    monacoLanguage,
    languageOptions,
    setLanguage,
    setCode,
    resetCode,
  } = useProblemEditor(problem);

  const { tests, isLoading, error } = useProblemTests(problem.problem_id, {
    type: "public",
  });
  const publicTests = Array.isArray(tests) ? (tests[0] ?? null) : tests;

  const preferences = useEditorStore((state) => state.preferences);
  const toggleWordWrap = useEditorStore((state) => state.toggleWordWrap);

  const activeTab = externalTab ?? "code";

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab as any);
  };

  const editorTheme = theme === "dark" ? "vs-dark" : "light";

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-col h-full w-full overflow-hidden bg-background"
    >
      {/* ── Single header row: language selector (left) + tabs (right) ── */}
      <header className="h-14 px-3 flex items-center gap-2 border-b border-border/40 bg-card/10 backdrop-blur-sm shrink-0 overflow-x-auto hide-scrollbar">
        {/* Language selector — only meaningful on Code tab */}
        {activeTab === "code" && (
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              languages={languageOptions}
            />

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-7 transition-colors shrink-0",
                preferences.wordWrap
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary",
              )}
              onClick={toggleWordWrap}
              title="Toggle Word Wrap"
              type="button"
            >
              <WrapText className="size-3.5" />
            </Button>

            {/* Reset Code Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  type="button"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/40">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sm font-bold">
                    Reset Code?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs text-muted-foreground">
                    This will permanently delete your current progress for this
                    language and restore the default boilerplate.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-8 text-xs font-bold border-border/40">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetCode}
                    className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Tabs — pushed to the right via ml-auto */}
        <TabsList className="bg-transparent h-10 p-0 gap-0 ml-auto shrink-0">
          <TabsTrigger value="code" className={TAB_CLS}>
            <Code2 className="size-3 mr-1.5 shrink-0" />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          <TabsTrigger value="testcase" className={TAB_CLS}>
            <Terminal className="size-3 mr-1.5 shrink-0" />
            <span className="hidden sm:inline">Tests</span>
          </TabsTrigger>
          <TabsTrigger value="result" className={TAB_CLS}>
            <CheckCircle2 className="size-3 mr-1.5 shrink-0" />
            <span className="hidden sm:inline">Result</span>
          </TabsTrigger>
        </TabsList>
      </header>

      {/* ── Code tab: Monaco editor ── */}
      <TabsContent
        value="code"
        className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden"
      >
        {/* On mobile use a fixed height; on desktop fill available flex space */}
        <div className="h-[990px] md:h-full w-full ">
          <Editor
            height="100%"
            defaultLanguage={monacoLanguage}
            language={monacoLanguage}
            theme={editorTheme}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: true,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              fontFamily: "var(--font-mono)",
              padding: { top: 16 },
              cursorSmoothCaretAnimation: "on",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              wordWrap: preferences.wordWrap ? "on" : "off",
              wrappingIndent: "indent",
            }}
          />
        </div>
      </TabsContent>

      <TabsContent
        value="testcase"
        className="flex-1 m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden"
      >
        <ConsolePanelAdapter
          tests={publicTests}
          isLoading={isLoading}
          error={error}
          defaultTab="testcase"
          runResult={runResult ?? null}
          isExecutionRunning={isExecutionRunning}
          verdict={verdict}
          isEvaluating={isEvaluating}
          pollingTests={pollingTests}
        />
      </TabsContent>

      <TabsContent
        value="result"
        className="flex-1 m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden"
      >
        <ConsolePanelAdapter
          tests={publicTests}
          isLoading={isLoading}
          error={error}
          defaultTab="result"
          runResult={runResult ?? null}
          isExecutionRunning={isExecutionRunning}
          verdict={verdict}
          isEvaluating={isEvaluating}
          pollingTests={pollingTests}
        />
      </TabsContent>
    </Tabs>
  );
};

/**
 * Thin adapter that drives ConsolePanel to the correct initial tab
 * based on which outer tab is active, without exposing ConsolePanel's
 * internal tab dualism to EditorPanel.
 */
const ConsolePanelAdapter: React.FC<{
  tests: import("@/types/api").ProblemTest | null;
  isLoading: boolean;
  error: Error | null;
  defaultTab: "testcase" | "result";
  runResult:
    | import("@/services/submission.service").RunSubmissionResponse
    | null;
  isExecutionRunning?: boolean;
  runError?: Error | null;
  verdict?: ExecutionVerdict | "PENDING" | null;
  isEvaluating?: boolean;
  pollingTests?:
    | import("@/services/submission.service").ExecutionTestResult[]
    | null;
}> = ({
  tests,
  isLoading,
  error,
  defaultTab,
  runResult,
  isExecutionRunning,
  runError,
  verdict,
  isEvaluating,
  pollingTests,
}) => (
  <ConsolePanel
    tests={tests}
    isLoading={isLoading}
    error={error}
    initialTab={defaultTab}
    runResult={runResult}
    runResultLoading={isExecutionRunning}
    runError={runError}
    verdict={verdict}
    isEvaluating={isEvaluating}
    pollingTests={pollingTests}
  />
);
