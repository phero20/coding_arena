import { ArrowRight, BookOpen, Code2, Play, CheckCircle2, Code, HelpCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BentoCard } from "./shared";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

const PYTHON_CODE = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i`;

export function PracticeModeCard() {
  return (
    <BentoCard href="/problem" className="min-h-[360px]">
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden group">
        {/* Global Toolbar mimicking Hero */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-border/40 bg-card/20 shrink-0">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-muted-foreground" />
            <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors mix-blend-difference">
              Practice Mode
            </span>
          </div>
        </div>

        {/* Dual pane layout */}
        <div className="flex-1 grid md:grid-cols-2 min-h-0">
          {/* Left Pane: Light UI Description */}
          <div className="flex flex-col bg-card/30 border-r border-border/40 min-w-0">
            {/* Left tabs */}
            <div className="h-10 px-3 border-b border-border/40 bg-muted/20 flex items-center gap-3 shrink-0 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary h-full flex items-center gap-1.5">
                <BookOpen className="size-3" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-wide border-border/0 text-muted-foreground/40 h-full flex items-center gap-1.5">
                <HelpCircle className="size-3" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-wide border-border/0 text-muted-foreground/40 h-full flex items-center gap-1.5">
                <CheckCircle2 className="size-3" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-wide border-border/0 text-muted-foreground/40 h-full flex items-center gap-1.5">
                <Code2 className="size-3" />
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-hidden flex-1 relative">
              {/* Meta */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground truncate">
                  1. Two Sum
                </h3>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold text-difficulty-easy border-difficulty-easy bg-difficulty-easy/5"
                >
                  Easy
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Given an array of integers{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                  nums
                </code>{" "}
                and an integer target, return indices of the two numbers such
                that they add up to{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                  target
                </code>
                .
              </p>

              <div className="rounded border border-border bg-muted/50 p-3 font-mono text-[9px] text-foreground/70 space-y-1">
                <p>
                  <span className="text-muted-foreground">Input:</span> nums =
                  [2,7,11,15], target = 9
                </p>
                <p>
                  <span className="text-muted-foreground">Output:</span> [0,1]
                </p>
              </div>

            </div>
          </div>

          {/* Right Pane: Dark UI Editor */}
          <div className="flex flex-col bg-card/80 min-w-0">
            {/* Editor tabs */}
            <div className="h-10 px-3 border-b border-border/40 bg-card/20 flex items-center justify-between shrink-0">
              <Badge className="text-[9px] font-bold px-1.5 h-4 bg-primary/10 text-primary hover:bg-primary/20">
                Python
              </Badge>
              <div className="flex gap-1">
                <div className="px-2 py-1 bg-muted/30 rounded flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Play className="size-2.5 text-muted-foreground/80" />
                </div>
                <div className="px-2 py-1 bg-muted/30 rounded flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Send className="size-2.5 text-muted-foreground/80" />
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-hidden relative">
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                showLineNumbers
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: "0.75rem",
                  fontSize: "0.7rem",
                  lineHeight: "1.7",
                  background: "transparent",
                  overflowX: "hidden",
                }}
                lineNumberStyle={{
                  color: "hsl(var(--muted-foreground) / 0.2)",
                  minWidth: "1.5rem",
                  paddingRight: "0.75rem",
                  userSelect: "none",
                }}
              >
                {PYTHON_CODE}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
