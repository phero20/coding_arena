"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Terminal, 
  Play, 
  RefreshCw, 
  ChevronLeft,
  PenLine,
  Clock,
  RotateCcw,
  Palette,
  ChevronsUpDown,
  AlignLeft,
  Settings,
  Code2,
  FileText,
  User,
  Pen,
  Pencil,
  PlayIcon,
  Keyboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TestCaseField } from "@/components/workspace-shared";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ButtonGroup } from "@/components/ui/button-group";

const RUST_CODE = `fn main() {
    let a = 25;
    let b = 17;
    
    println!("Calculating sum...");
    println!("Sum of {} + {} is: {}", a, b, a + b);
}`;

const CompilerSection = () => {
  return (
    <div className='flex flex-col gap-10 py-20 sm:pt-28 pb-32 border-b overflow-hidden bg-background'>
      {/* Centered Header */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Compiler Playground
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
              A high-performance sandbox where you can code and test logic in multiple languages. <br className="hidden sm:block" />
              Execute your scripts instantly in a distraction-free environment.
          </p>
      </div>

      <div className='mx-auto w-full max-w-7xl px-4 md:px-0 relative z-10 flex flex-col items-center gap-4 mt-8'>
        
        <div className="w-full relative pointer-events-none">
          <Card className="relative flex min-h-[900px] md:min-h-[600px] flex-col border border-border/50 bg-background shadow-none rounded-xl  overflow-hidden">
            {/* Top Bar */}
            <header className="relative flex h-[60px] items-center border-b border-border/40 px-4 shrink-0 justify-between bg-background">
              {/* Left: Home */}
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs font-semibold pointer-events-none">
                <ChevronLeft className="size-4 sm:mr-1.5" /> <span className="hidden sm:inline-block">Home</span>
              </Button>
              
              {/* Center: Scratchpad & Run */}
              <ButtonGroup className="absolute left-1/2 -translate-x-1/2 flex items-center h-9 overflow-hidden">
                <Button variant={"outline"} className="flex items-center justify-center gap-2 px-3 sm:px-4 h-full text-xs font-semibold cursor-pointer transition-colors">
                  <Pencil className="size-3.5" /> <span className="hidden sm:inline-block">Scratchpad</span>
                </Button>
                <Button variant={"outline"} className="flex items-center justify-center gap-2 px-3 sm:px-5 h-full text-xs font-semibold cursor-pointer transition-colors">
                  <Play className="size-3.5" /> <span className="hidden sm:inline-block">Run</span>
                </Button>
              </ButtonGroup>

              {/* Right: Timer, Palette, Avatar */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:flex items-center gap-3 h-9 px-4 rounded-md border border-border/40 bg-card text-[13px] font-bold font-mono tracking-wider">
                  <Clock className="size-3.5 text-muted-foreground" /> 
                  <span>09:06</span>
                  <Play className="size-3.5 text-foreground hover:text-primary cursor-pointer transition-colors fill-current" />
                  <RotateCcw className="size-3.5 text-foreground hover:text-primary cursor-pointer transition-colors" />
                </div>
                <Button variant="outline" size="icon" className="size-8 sm:size-9 rounded-full border-border/40 pointer-events-none hover:bg-transparent">
                  <Palette className="size-4 text-primary" />
                </Button>
                <Avatar className="size-8 sm:size-9 border border-border/40">
                  <AvatarFallback className="text-primary-foreground">
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>

            {/* Sub-Header (Split 50/50 matching panels below) */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border/40 bg-background shrink-0 text-muted-foreground divide-y md:divide-y-0 md:divide-x divide-border/40">
              
              {/* Left Panel Header */}
              <div className="flex items-center justify-between px-4 h-12">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 md:py-0">
                  <div className="flex items-center gap-2 h-8 px-3 shrink-0 rounded-md border border-border/40 bg-card/50 text-[11px] font-bold text-foreground cursor-pointer hover:bg-card transition-colors">
                    <Terminal className="size-3.5 text-primary" />
                    Python
                    <ChevronsUpDown className="size-3 ml-2 opacity-50" />
                  </div>
                  <div className="flex items-center justify-center shrink-0 h-8 w-8 rounded-md bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                    <AlignLeft className="size-4" />
                  </div>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-foreground pointer-events-none">
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-foreground pointer-events-none">
                    <Settings className="size-4" />
                  </Button>
                </div>
                <div className="items-center shrink-0 gap-2 text-[11px] font-black tracking-widest text-primary h-full hidden md:flex">
                  <Code2 className="size-4" /> CODE
                </div>
              </div>

              {/* Right Panel Header */}
              <div className="flex items-center justify-start md:justify-end px-4 h-12 gap-8 text-[11px] font-black tracking-widest">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors h-full border-b-2 border-transparent">
                  <Keyboard className="size-4" /> INPUT
                </div>
                <div className="flex items-center gap-2 text-primary cursor-pointer h-full border-b-2 border-primary">
                  <Terminal className="size-4" /> OUTPUT
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40 overflow-hidden">
              {/* Editor Panel (L) */}
              <div className="flex flex-col min-w-0 bg-card/5 pt-2">
                
                <div className="flex-1 relative bg-card/80 overflow-y-auto">
                  <SyntaxHighlighter
                    language="rust"
                    style={vscDarkPlus}
                    showLineNumbers
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.85rem",
                      lineHeight: "1.7",
                      background: "transparent",
                      height: "100%",
                    }}
                    lineNumberStyle={{
                      color: "hsl(var(--muted-foreground) / 0.2)",
                      minWidth: "2.5rem",
                      paddingRight: "1rem",
                      userSelect: "none",
                    }}
                  >
                    {RUST_CODE}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Console Panel (R) */}
              <div className="flex flex-col min-w-0 bg-background">
                
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto pt-4">
                   <div className="space-y-4 max-w-4xl">
                     <div className="flex items-center gap-2">
                       <Terminal className="size-3.5 text-muted-foreground" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                         Result
                       </span>
                       <Badge
                         variant="outline"
                         className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-none whitespace-nowrap flex items-center gap-1 w-fit leading-none p-1 bg-difficulty-easy text-status-accepted"
                       >
                         Success
                       </Badge>
                     </div>
                     
                     <TestCaseField 
                       label="Output"
                       value={"Calculating sum...\nSum of 25 + 17 is: 42"}
                       isOutput
                     />
                   </div>
                </div>   
                   <div className="mt-auto  pointer-events-none">
                      <div className="h-px bg-border/40 w-full mb-4" />
                      <div className="flex items-center gap-3">
                         <div className="size-2 rounded-full bg-primary" />
                         <div className="h-2 w-24 rounded-full bg-muted" />
                      </div>
                   </div>
                </div>
              </div>
          </Card>

          {/* Fade Overlay & CTA */}
          <div className="absolute inset-x-0 -bottom-10 md:-bottom-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent pt-60 pb-4 md:pb-12 z-30 pointer-events-auto">
            <h3 className="text-2xl text-center font-bold text-foreground mb-4 tracking-tight">
              Powerful Execution Engine
            </h3>
            <p className="text-foreground/80 text-sm text-center max-w-3xl leading-relaxed mb-6">
              Write, compile, and execute code in <span className="text-foreground font-medium underline decoration-primary underline-offset-4">multiple languages</span> instantly. Benefit from <span className="text-foreground font-medium underline decoration-primary underline-offset-4">sub-second compilation</span>, <span className="text-foreground font-medium underline decoration-primary underline-offset-4">standard input support</span>, and <span className="text-foreground font-medium underline decoration-primary underline-offset-4">live console feedback</span> in a distraction-free environment.
            </p>
            <Button
              variant="link"
              className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
              asChild
            >
              <Link href="/compiler">
                Open Compiler <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerSection;