"use client";

import React, { useState, useMemo } from "react";
import { DynamicEditor as Editor } from "@/components/workspace-shared/editor/DynamicEditor";
import { LanguageSelector } from "@/components/workspace-shared/editor/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Problem } from "@/types/api";
import {
  RefreshCw,
  Code2,
  Terminal,
  CheckCircle2,
  WrapText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useProblemEditor } from "@/hooks/workspace/use-problem-editor";
import { useEditorStore } from "@/store/use-editor-store";
import { useMonacoConfig } from "@/hooks/workspace/use-monaco-config";
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
import type { TrackExerciseResponse, ExerciseRunResult } from "@/types/academy";
import { AcademyConsolePanel } from "./AcademyConsolePanel";

const TAB_CLS =
  "h-10 rounded-none px-3 text-[11px] font-black uppercase tracking-wide " +
  "border-b-2 border-transparent shrink-0 " +
  "data-[state=active]:bg-transparent data-[state=active]:text-primary " +
  "data-[state=active]:shadow-none data-[state=active]:border-primary transition-all";

export interface AcademyEditorPanelProps {
  exercise: TrackExerciseResponse;
  problemData: Problem;
  trackSlug: string;
  runResult: ExerciseRunResult | null;
  isExecutionRunning: boolean;
  runError: Error | null;
  activeTab: "code" | "testcase" | "result";
  onTabChange: (tab: "code" | "testcase" | "result") => void;
}

export const AcademyEditorPanel: React.FC<AcademyEditorPanelProps> = ({
  exercise,
  problemData,
  trackSlug,
  runResult,
  isExecutionRunning,
  runError,
  activeTab,
  onTabChange,
}) => {
  const sessionId = `academy:${exercise.id}`;

  const {
    language,
    code,
    monacoLanguage,
    languageOptions,
    setLanguage,
    setCode,
    resetCode,
  } = useProblemEditor(problemData, sessionId, trackSlug);

  const preferences = useEditorStore((state) => state.preferences);
  const toggleWordWrap = useEditorStore((state) => state.toggleWordWrap);

  const monacoOptions = useMonacoConfig(preferences);

  const handleEditorWillMount = (monaco: any) => {
    // Disable validation for JS/TS to provide a LeetCode-like experience
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    if (monaco.languages.css) {
      monaco.languages.css.cssDefaults.setDiagnosticsOptions({ validate: false });
    }
    if (monaco.languages.json) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: false });
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as any)}
      className="flex flex-col h-full w-full overflow-hidden bg-background"
    >
      {/* ── Single header row: language selector (left) + tabs (right) ── */}
      <header className="h-14 md:h-12 px-3 flex items-center gap-2 border-b border-border/40 bg-card/10 backdrop-blur-sm shrink-0 overflow-x-auto hide-scrollbar">
        {/* Language selector — only meaningful on Code tab */}
        {activeTab === "code" && (
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="font-black tracking-widest text-[10px] uppercase py-1 px-3 border-border/40 text-primary bg-primary/5"
            >
              {trackSlug}
            </Badge>

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
              <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-md text-primary font-bold">
                    Reset Code?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground">
                    This will permanently delete your current progress for this
                    language and restore the default boilerplate.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-8 text-xs font-bold border-border">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetCode}
                    className="h-8 text-xs font-bold"
                  >
                    Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Link href="/settings?tab=editor">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-primary transition-colors shrink-0"
                title="Editor Settings"
              >
                <Settings className="size-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Tabs — pushed to the right via ml-auto */}
        <TabsList className="bg-transparent h-10 p-0 gap-0 md:gap-2 ml-auto shrink-0">
          <TabsTrigger value="code" className={TAB_CLS}>
            <Code2 className="size-4 md:mr-1 shrink-0" />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          <TabsTrigger value="testcase" className={TAB_CLS}>
            <Terminal className="size-4 md:mr-1 shrink-0" />
            <span className="hidden sm:inline">Tests</span>
          </TabsTrigger>
          <TabsTrigger value="result" className={TAB_CLS}>
            <CheckCircle2 className="size-4 md:mr-1 shrink-0" />
            <span className="hidden sm:inline">Result</span>
          </TabsTrigger>
        </TabsList>
      </header>

      {/* ── Code tab: Monaco editor ── */}
      <TabsContent
        value="code"
        className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden"
      >
        <div className="h-[990px] md:h-full w-full ">
          <Editor
            height="100%"
            beforeMount={handleEditorWillMount}
            defaultLanguage={monacoLanguage}
            language={monacoLanguage}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              ...monacoOptions,
              readOnly: false,
            }}
          />
        </div>
      </TabsContent>

      <TabsContent
        value="testcase"
        className="flex-1 m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden"
      >
        <AcademyConsolePanel
          exercise={exercise}
          trackSlug={trackSlug}
          activeTab="testcase"
          runResult={runResult}
          isExecutionRunning={isExecutionRunning}
          runError={runError}
        />
      </TabsContent>

      <TabsContent
        value="result"
        className="flex-1 m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden"
      >
        <AcademyConsolePanel
          exercise={exercise}
          trackSlug={trackSlug}
          activeTab="result"
          runResult={runResult}
          isExecutionRunning={isExecutionRunning}
          runError={runError}
        />
      </TabsContent>
    </Tabs>
  );
};
