import { Terminal, Keyboard, Check, Play } from "lucide-react";
import { BentoCard } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CPP_CODE = `#include <iostream>

int main() {
    std::cout << "SlaveCode compiler online.\\n";
    std::cout << "Ready for execution.\\n";
    return 0;
}`;

export function CompilerCard() {
  return (
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
            <div className="flex-1 overflow-hidden">
              <SyntaxHighlighter
                language="cpp"
                style={vscDarkPlus}
                showLineNumbers
                PreTag="div"
                customStyle={{
                  margin: 0,
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
                  userSelect: "none",
                }}
              >
                {CPP_CODE}
              </SyntaxHighlighter>
            </div>
          </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
