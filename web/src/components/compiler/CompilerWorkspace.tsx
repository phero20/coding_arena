"use client";

import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WorkspaceHeader, Scratchpad } from "@/components/workspace-shared";
import { CompilerEditor } from "./CompilerEditor";
import { CompilerConsole } from "./CompilerConsole";
import { useCompilerWorkspace } from "@/hooks/workspace/use-compiler-workspace";
import { useRouter } from "next/navigation";

export const CompilerWorkspace: React.FC = () => {
  const {
    languages, language, code, stdin, result,
    isExecuting, setLanguage, setCode, setStdin, runCode, resetCode,
  } = useCompilerWorkspace();

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const playgroundProblem = { 
    problem_id: "compiler-playground", 
    title: "Compiler Playground" 
  } as any;

  const router = useRouter();

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={playgroundProblem}
        onRun={runCode}
        onExit={() => router.push("/")}
        exitText="Home"
        isLoading={isExecuting}
        hideSubmit
        onToggleScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
        isScratchpadOpen={isScratchpadOpen}
        allowUnauthenticatedRun
      />

      <Scratchpad 
        isOpen={isScratchpadOpen} 
        onClose={() => setIsScratchpadOpen(false)} 
        problem={playgroundProblem}
      />

      {/* Desktop */}
      <div className="flex-1 min-h-0 hidden md:block">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={60} minSize={25}
            className="bg-card/30 backdrop-blur-sm border-r border-border/40">
            <CompilerEditor code={code} onChange={setCode} language={language}
              languages={languages} onLanguageChange={setLanguage} onReset={resetCode} />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/20 hover:bg-primary/50 transition-colors" />

          <ResizablePanel defaultSize={40} minSize={20} className="bg-card/30 backdrop-blur-sm">
            <CompilerConsole stdin={stdin} onStdinChange={setStdin}
              result={result} isExecuting={isExecuting} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile */}
      <div className="flex-1 flex flex-col md:hidden overflow-y-auto custom-scrollbar">
        <section className="h-[500px] shrink-0 border-b border-border/40 bg-card/10">
          <CompilerEditor code={code} onChange={setCode} language={language}
            languages={languages} onLanguageChange={setLanguage} onReset={resetCode} />
        </section>
        <section className="flex-1 bg-card/30">
          <CompilerConsole stdin={stdin} onStdinChange={setStdin}
            result={result} isExecuting={isExecuting} />
        </section>
      </div>
    </div>
  );
};
