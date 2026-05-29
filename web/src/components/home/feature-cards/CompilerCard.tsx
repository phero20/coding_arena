<<<<<<< HEAD
import { Terminal, Keyboard, Check, Play } from "lucide-react";
import { BentoCard } from "./shared";
import { Badge } from "@/components/ui/badge";
=======
import { Terminal } from "lucide-react";
import { BentoCard } from "./shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
>>>>>>> prod-deploy
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CPP_CODE = `#include <iostream>

int main() {
<<<<<<< HEAD
    std::cout << "SlaveCode compiler online.\\n";
    std::cout << "Ready for execution.\\n";
=======
    std::cout << "Hello Arena";
>>>>>>> prod-deploy
    return 0;
}`;

export function CompilerCard() {
  return (
<<<<<<< HEAD
    <BentoCard href="/compiler" className="min-h-[320px]">
      <div className="flex-1 flex flex-col overflow-hidden bg-background h-full">
        {/* Header spanning both panes */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-border/40 bg-card/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Terminal className="size-4 text-muted-foreground" />
            <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
              Compiler Playground
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-[10px] font-bold rounded-md px-2 h-5 bg-primary/10 text-primary border-transparent"
            >
              C++
            </Badge>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-1.5 text-muted-foreground/40 px-2 py-1 rounded bg-muted/10 cursor-pointer">
              <Play className="size-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Run
              </span>
            </div>
          </div>
        </div>

        {/* Split UI */}
        <div className="flex-1 grid md:grid-cols-2 min-h-0">
          {/* Left: Code Editor */}
          <div className="flex flex-col border-r border-border/20 relative min-w-0">
=======
    <BentoCard href="/compiler" className="min-h-[340px] group/card relative">
      <div className="flex-1 flex flex-col overflow-hidden bg-background/20 h-full">
        {/* Simple Header */}
        <div className="h-12 px-4 flex items-center border-b border-border/40 bg-card/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-muted-foreground/70" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
              Compiler
            </span>
          </div>
        </div>

        {/* Workspace Split View (Realistic) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 overflow-y-auto md:overflow-hidden custom-scrollbar">
          {/* Left: Editor Panel */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-border/40 overflow-hidden min-h-[300px] md:min-h-0 bg-card/80">
>>>>>>> prod-deploy
            <div className="flex-1 overflow-hidden">
              <SyntaxHighlighter
                language="cpp"
                style={vscDarkPlus}
                showLineNumbers
                PreTag="div"
                customStyle={{
                  margin: 0,
<<<<<<< HEAD
                  padding: "1rem",
                  fontSize: "0.75rem",
                  lineHeight: "1.8",
                  background: "transparent",
                  overflowX: "auto",
                }}
                lineNumberStyle={{
                  color: "hsl(var(--muted-foreground) / 0.2)",
                  minWidth: "2rem",
                  paddingRight: "1rem",
=======
                  padding: "0.875rem",
                  fontSize: "0.68rem",
                  lineHeight: "1.7",
                  background: "transparent",
                  overflowX: "auto",
                  height: "100%",
                }}
                lineNumberStyle={{
                  color: "hsl(var(--muted-foreground) / 0.2)",
                  minWidth: "1.6rem",
                  paddingRight: "0.75rem",
>>>>>>> prod-deploy
                  userSelect: "none",
                }}
              >
                {CPP_CODE}
              </SyntaxHighlighter>
            </div>
          </div>

<<<<<<< HEAD
          {/* Right: I/O Terminal */}
          <div className="flex flex-col bg-card/60 min-w-0 relative">
            <div className="px-4 py-2 flex items-center gap-2 border-b border-border/40 bg-muted/40">
              <Keyboard className="size-3 text-muted-foreground/50" />
              <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/50">
                Console Output
              </span>
            </div>

            <div className="p-4 font-mono text-[11.5px] leading-relaxed flex-1 overflow-hidden">
              <div className="text-muted-foreground/40 mb-2">
                ~ $ g++ main.cpp -o main && ./main
              </div>
              <div className="text-difficulty-easy/80 mb-2">
                [Build finished in 0.42s]
              </div>
              <div className="text-foreground/80">
                SlaveCode compiler online.
              </div>
              <div className="text-foreground/80">Ready for execution.</div>
              
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-muted-foreground/40 mt-6">
                <Check className="size-3.5 text-difficulty-easy/80" />
                <span>Process exited with code 0</span>
=======
          {/* Right: Console/Output Panel */}
          <div className="flex flex-col bg-card/20 overflow-hidden min-h-[200px] md:min-h-0">
            <div className="h-12 px-3 flex items-center border-b border-border/40 bg-card/10 backdrop-blur-sm shrink-0">
              <div className="ml-auto flex items-center gap-0">
                <div className="h-8 px-2.5 text-[9px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/60 flex items-center">
                  Input
                </div>
                <div className="h-8 px-2.5 text-[9px] font-black uppercase tracking-wide border-b-2 border-primary text-primary flex items-center">
                  Output
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="size-3 text-muted-foreground" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  Result
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[8.5px] font-bold uppercase tracking-wide border-none whitespace-nowrap leading-none px-2 py-1",
                    "bg-status-accepted text-status-accepted",
                  )}
                >
                  Success
                </Badge>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Output
                </p>
                <div className="rounded-md border border-border/30 bg-muted/30 px-2.5 py-2 font-mono text-[10px] text-foreground/85">
                  Hello Arena
                </div>
>>>>>>> prod-deploy
              </div>
            </div>
          </div>
        </div>
<<<<<<< HEAD
=======

        {/* Global Decoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] -z-1 pointer-events-none" />
>>>>>>> prod-deploy
      </div>
    </BentoCard>
  );
}
