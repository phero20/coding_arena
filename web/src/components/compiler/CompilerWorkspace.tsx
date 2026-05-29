"use client";

<<<<<<< HEAD
import React from "react";
=======
import React, { useState } from "react";
>>>>>>> prod-deploy
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
<<<<<<< HEAD
import { WorkspaceHeader } from "@/components/workspace-shared/WorkspaceHeader";
=======
import { WorkspaceHeader, Scratchpad } from "@/components/workspace-shared";
>>>>>>> prod-deploy
import { CompilerEditor } from "./CompilerEditor";
import { CompilerConsole } from "./CompilerConsole";
import { useCompilerWorkspace } from "@/hooks/workspace/use-compiler-workspace";
import { useRouter } from "next/navigation";

export const CompilerWorkspace: React.FC = () => {
  const {
    languages, language, code, stdin, result,
    isExecuting, setLanguage, setCode, setStdin, runCode,
  } = useCompilerWorkspace();

<<<<<<< HEAD
=======
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const playgroundProblem = { 
    problem_id: "compiler-playground", 
    title: "Compiler Playground" 
  } as any;

>>>>>>> prod-deploy
  function handleReset() {
    localStorage.removeItem("coding-arena-playground-state");
    window.location.reload();
  }
  const router = useRouter();
<<<<<<< HEAD
  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={{ title: "Compiler Playground" } as any}
=======

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <WorkspaceHeader
        problem={playgroundProblem}
>>>>>>> prod-deploy
        onRun={runCode}
        onExit={() => router.push("/")}
        exitText="Home"
        isLoading={isExecuting}
        hideSubmit
<<<<<<< HEAD
=======
        onToggleScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
        isScratchpadOpen={isScratchpadOpen}
      />

      <Scratchpad 
        isOpen={isScratchpadOpen} 
        onClose={() => setIsScratchpadOpen(false)} 
        problem={playgroundProblem}
>>>>>>> prod-deploy
      />

      {/* Desktop */}
      <div className="flex-1 min-h-0 hidden md:block">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={60} minSize={25}
            className="bg-card/30 backdrop-blur-sm border-r border-border/40">
            <CompilerEditor code={code} onChange={setCode} language={language}
              languages={languages} onLanguageChange={setLanguage} onReset={handleReset} />
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
            languages={languages} onLanguageChange={setLanguage} onReset={handleReset} />
        </section>
        <section className="flex-1 bg-card/30">
          <CompilerConsole stdin={stdin} onStdinChange={setStdin}
            result={result} isExecuting={isExecuting} />
        </section>
      </div>
    </div>
  );
};
