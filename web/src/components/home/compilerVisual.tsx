"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Terminal, 
  Code2, 
  Keyboard, 
  Play, 
  RefreshCw, 
  LogOut,
  Swords,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const ease = [0.16, 1, 0.3, 1] as const;

const RUST_CODE = `fn main() {
    let a = 25;
    let b = 17;
    
    println!("Calculating sum...");
    println!("Sum of {} + {} is: {}", a, b, a + b);
}`;

/* ── 1. Compiler Production Visual ── */
export const CompilerVisual = () => (
  <div className="relative h-full flex flex-col rounded-xl border border-border/60 bg-background overflow-hidden shadow-2xl group">
    {/* Workspace Header Replica */}
    <header className="h-14 px-4 border-b border-border/40 bg-card/10 backdrop-blur-sm flex items-center justify-between shrink-0">
      <Button variant="outline" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider border-border/40 opacity-50 pointer-events-none">
          <ArrowLeft className="size-3 mr-1.5" /> Home
        </Button>
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]">
          <Play className="size-3 mr-1.5" /> Run
        </Button>
      </div>
    </header>

    {/* Main Workspace Body */}
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
      {/* Editor Panel (L) */}
      <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-border/40 bg-card/5">
        <div className="h-12 px-3 flex items-center justify-between border-b border-border/40 bg-card/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-border/40 bg-background text-[10px] font-black uppercase tracking-wider text-primary">
              Rust
              <ChevronDown className="size-3 opacity-40" />
            </div>
            <div className="size-7 rounded border border-border/40 flex items-center justify-center opacity-30">
              <RefreshCw className="size-3" />
            </div>
          </div>
          <div className="flex items-center h-full">
            <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary">
               Code
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden bg-card/20">
          <SyntaxHighlighter
            language="rust"
            style={vscDarkPlus}
            showLineNumbers
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.75rem",
              lineHeight: "1.7",
              background: "transparent",
            }}
            lineNumberStyle={{
              color: "hsl(var(--muted-foreground) / 0.2)",
              minWidth: "2rem",
              paddingRight: "1rem",
            }}
          >
            {RUST_CODE}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Console Panel (R) */}
      <div className="lg:col-span-5 flex flex-col bg-card/10">
        <div className="h-12 px-3 flex items-center border-b border-border/40 bg-card/10">
          <div className="ml-auto flex items-center gap-0">
             <div className="flex items-center gap-1.5 h-full px-4 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/30">
                <Keyboard className="size-3" />
                Input
             </div>
             <div className="flex items-center gap-1.5 h-full px-4 text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary">
                <Terminal className="size-3" />
                Output
             </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-6">
           <div className="flex items-center gap-2">
             <div className="px-2 py-1 rounded-full bg-status-accepted/10 text-status-accepted text-[9px] font-bold uppercase tracking-wider border border-status-accepted/20">
               Success
             </div>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">24ms</span>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                 <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Compiler Output</p>
                 <div className="p-4 rounded-lg border border-border/40 bg-background/50 font-mono text-[11px] leading-relaxed">
                    <p className="text-foreground/90">Calculating sum...</p>
                    <p className="text-foreground/90">Sum of 25 + 17 is: 42</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-auto opacity-20 pointer-events-none">
              <div className="h-px bg-border/40 w-full mb-4" />
              <div className="flex items-center gap-3">
                 <div className="size-2 rounded-full bg-primary" />
                 <div className="h-2 w-24 rounded-full bg-muted" />
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

export const CompilerSection = () => {
  return (
    <section className="relative py-32 bg-background overflow-hidden ">
      <Container className="max-w-[1440px] px-3 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          {/* Visual (10 Columns) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, x: -20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              <CompilerVisual />
            </motion.div>
          </div>

          {/* Text (2 Columns) */}
          <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col items-start gap-6">
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, ease }}
               className="space-y-6"
            >
              <h2 className="text-3xl lg:text-4xl font-black tracking-tighter leading-[0.95] uppercase">
                Compiler Playground
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A high-performance sandbox where you can code and test logic in multiple languages. Execute your scripts instantly in a distraction-free environment.
              </p>
              
              <div className="space-y-3 pt-4">
                {[
                  "Sub-second compilation",
                  "Standard input support",
                  "Live console feedback"
                ].map((highlight) => (
                  <div key={highlight} className="flex items-center gap-3">
                    <div className="size-1 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export const CallToAction = () => {
  return (
    <section className="relative py-40 overflow-hidden border-t border-border/20">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] leading-[1.0] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/80 to-foreground/30">
              Ready to enter the arena?
            </span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-sm mx-auto leading-relaxed mb-12">
            Join thousands of developers competing, growing, and proving their
            skills every day. Your rank is waiting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 font-semibold rounded-full text-sm w-full sm:w-auto"
            >
              <Link href="/auth/register">
                Create Free Account
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 font-semibold rounded-full text-sm border-border/50 text-muted-foreground hover:text-foreground w-full sm:w-auto"
            >
              <Link href="/arena">Watch Live Battles</Link>
            </Button>
          </div>

          <p className="mt-8 text-[11px] text-muted-foreground/30 font-medium">
            Free forever · No credit card required · Instant access
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
