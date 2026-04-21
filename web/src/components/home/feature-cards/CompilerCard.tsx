import { Terminal } from "lucide-react";
import { BentoCard } from "./shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CPP_CODE = `#include <iostream>

int main() {
    std::cout << "Hello Arena";
    return 0;
}`;

export function CompilerCard() {
  return (
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
            <div className="flex-1 overflow-hidden">
              <SyntaxHighlighter
                language="cpp"
                style={vscDarkPlus}
                showLineNumbers
                PreTag="div"
                customStyle={{
                  margin: 0,
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
                  userSelect: "none",
                }}
              >
                {CPP_CODE}
              </SyntaxHighlighter>
            </div>
          </div>

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
              </div>
            </div>
          </div>
        </div>

        {/* Global Decoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] -z-1 pointer-events-none" />
      </div>
    </BentoCard>
  );
}
