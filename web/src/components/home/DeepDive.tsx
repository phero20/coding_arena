"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import {
  Swords,
  Terminal,
  Keyboard,
  Timer,
  Lock,
  Zap,
  Check,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ease = [0.16, 1, 0.3, 1] as const;

const codeLines = [
  { code: "def two_sum(nums, target):", hl: false },
  { code: "    seen = {}", hl: false },
  { code: "    for i, n in enumerate(nums):", hl: false },
  { code: "        diff = target - n", hl: false },
  { code: "        if diff in seen:", hl: false },
  { code: "            return [seen[diff], i]", hl: true },
  { code: "        seen[n] = i", hl: false },
];

/* ── Arena Visual — mirrors actual arena match panel ── */
const ArenaVisual = () => (
  <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden">
    {/* Header — same style as app panels */}
    <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border/30 bg-card/30">
      <Swords className="size-4 text-muted-foreground/60" />
      <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground/60">
        Arena Match
      </span>
    </div>
    <div className="p-5 space-y-4">
      {/* Match concept rows — real fields, no fake IDs or names */}
      {[
        { icon: Timer, label: "Round Type", value: "Timed Duel" },
        { icon: Code2, label: "Format", value: "Same problem, same time" },
        { icon: Lock, label: "Visibility", value: "Live opponent progress" },
        { icon: Zap, label: "Results", value: "Real-time test case scoring" },
      ].map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between py-2 border-b border-border/10 last:border-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded border border-border/20 bg-card/50 flex items-center justify-center">
              <row.icon className="size-3 text-muted-foreground/40" />
            </div>
            <span className="text-[11px] text-muted-foreground/50 font-mono">
              {row.label}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-foreground/60">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Compiler Visual — mirrors real CompilerConsole layout exactly ── */
const CompilerVisual = () => (
  <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden">
    {/* Header — exact same h-14 header as CompilerConsole */}
    <div className="h-14 px-3 flex items-center border-b border-border/40 bg-card/10 backdrop-blur-sm">
      <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground/60 flex items-center gap-2">
        <Terminal className="size-4" />
        Compiler Playground
      </span>
      {/* Real tab style from CompilerConsole */}
      <div className="ml-auto flex">
        {[
          { label: "Input", icon: Keyboard, active: true },
          { label: "Output", icon: Terminal, active: false },
        ].map((tab) => (
          <div
            key={tab.label}
            className={cn(
              "h-10 px-3 text-[11px] font-black uppercase tracking-wide border-b-2 flex items-center gap-1.5",
              tab.active ? "border-primary text-primary" : "border-transparent text-muted-foreground/30",
            )}
          >
            <tab.icon className="size-3" />
            {tab.label}
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 divide-x divide-border/20">
      {/* Input side — mirrors CompilerConsole stdin tab */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard className="size-4 text-primary shrink-0" />
          <p className="text-xs font-bold text-foreground/60">Program Input</p>
        </div>
        <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
          Type stdin before running. One value per line.
        </p>
        <div className="rounded-md border border-border/20 bg-muted/10 p-3 font-mono text-[11px] text-muted-foreground/30">
          <div>{">"} 5</div>
          <div>{">"} hello world</div>
          <div className="opacity-30">{">"} _</div>
        </div>
        {/* Language tabs row */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["Python", "C++", "Go", "JS"].map((l, i) => (
            <div
              key={l}
              className={cn(
                "px-2 py-0.5 rounded border text-[9px] font-bold",
                i === 0
                  ? "border-foreground/25 bg-foreground/5 text-foreground/60"
                  : "border-border/20 text-muted-foreground/25",
              )}
            >
              {l}
            </div>
          ))}
          <div className="px-2 py-0.5 rounded border border-border/10 text-[9px] text-muted-foreground/20">
            +8
          </div>
        </div>
      </div>

      {/* Output side — mirrors CompilerConsole output tab */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-muted-foreground/60" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
            Result
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-difficulty-easy/10 text-difficulty-easy px-2 py-0.5 rounded">
            Success
          </span>
        </div>
        {/* Output field mirrors TestCaseField */}
        <div className="rounded-md border border-border/20 bg-card/30 overflow-hidden">
          <div className="px-3 py-1 border-b border-border/15 bg-muted/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
              Output
            </span>
          </div>
          <div className="p-3 font-mono text-[11px] text-foreground/50">
            Hello, Arena!
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="size-3.5 text-difficulty-easy" />
          <span className="text-[10px] text-muted-foreground/40">
            Exit 0 · &lt; 500ms
          </span>
        </div>
      </div>
    </div>
  </div>
);

const features = [
  {
    tag: "Real-time",
    title: "Live Arena Battles",
    description:
      "Challenge any developer to a timed duel. You both get the same problem at the same time. Solve it faster and watch your rating climb — every match is pure skill.",
    visual: <ArenaVisual />,
  },
  {
    tag: "Multi-language",
    title: "Compiler Playground",
    description:
      "Write and run code in 12+ languages right in your browser. Full stdin support, per-language session caching, and instant output — built to feel like a real IDE.",
    visual: <CompilerVisual />,
  },
];

export const DeepDive = () => {
  return (
    <section className="relative py-40 overflow-hidden">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-24"
        >

          <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] leading-[1.08] max-w-xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/80 to-foreground/30">
              Built for serious developers.
            </span>
          </h2>
        </motion.div>

        <div className="space-y-32">
          {features.map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center",
                index % 2 !== 0 && "lg:[direction:rtl]",
              )}
            >
              <div className={cn(index % 2 !== 0 && "lg:[direction:ltr]")}>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full border border-border/30 bg-card/30 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 mb-6">
                  {feat.tag}
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground/90 mb-5">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base max-w-md">
                  {feat.description}
                </p>
              </div>
              <div className={cn(index % 2 !== 0 && "lg:[direction:ltr]")}>
                {feat.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};
