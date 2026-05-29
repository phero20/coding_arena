"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container } from "@/components/shared/Container";
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Code2,
  Play,
  Send,
  Timer,
  ChevronLeft,
  WrapText,
  RefreshCw,
  Terminal,
  Swords,
} from "lucide-react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
=======
import { ButtonGroup } from "../ui/button-group";
>>>>>>> prod-deploy

const ease = [0.16, 1, 0.3, 1] as const;

// Real tab definitions mirroring use-workspace-tabs.ts (practice mode)
const LEFT_TABS = [
  { id: "description", label: "Description", icon: BookOpen },
  { id: "hints", label: "Hints", icon: HelpCircle },
  { id: "solutions", label: "Solutions", icon: CheckCircle2 },
  { id: "submissions", label: "Submissions", icon: Code2 },
];

// Real editor tab definitions mirroring EditorPanel.tsx
const RIGHT_TABS = [
  { id: "code", label: "Code", icon: Code2 },
  { id: "testcase", label: "Tests", icon: Terminal },
  { id: "result", label: "Result", icon: CheckCircle2 },
];

const TAB_CLS =
  "h-10 rounded-none px-3 text-[11px] font-black uppercase tracking-wide " +
  "border-b-2 border-transparent shrink-0 " +
  "data-[state=active]:bg-transparent data-[state=active]:text-primary " +
  "data-[state=active]:shadow-none data-[state=active]:border-primary transition-all";

<<<<<<< HEAD
const JAVA_CODE = `class Solution {
=======
const JAVA_CODE = ` class Solution {
>>>>>>> prod-deploy
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            
            map.put(nums[i], i);
        }
        
        return new int[] {};
    }
}`;

export const Hero = () => {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle structural grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <Container className="relative z-10 py-44">
        {/* ── Hero Copy ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
<<<<<<< HEAD
          className="flex flex-col md:flex-row items-center md:items-center justify-between max-w-6xl mx-auto mb-20 gap-12 lg:gap-20 pb-10 px-2 md:px-8 lg:px-0"
        >
          {/* Left Side: Brand Name */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="flex-1 text-center md:text-left w-full flex items-center   justify-start"
          >
            <h1 className="text-[clamp(4rem,10vw,7.5rem)] font-bold tracking-tight text-foreground leading-none flex items-baseline">
              SlaveCode
              <span className="ml-1 text-[clamp(4rem,10vw,7.5rem)] leading-none text-primary/60">.</span>
=======
          className="flex flex-col md:flex-row items-center md:items-center justify-between max-w-7xl mx-auto mb-20 gap-12 lg:gap-20 pb-10 px-2 md:px-4 lg:px-0"
        >
          {/* Left Side: Brand Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="flex-1 text-left w-full flex items-center justify-start min-w-0"
          >
            <h1 className="text-[clamp(2.75rem,14vw,7.5rem)] font-bold tracking-tight text-foreground leading-none flex items-baseline whitespace-nowrap max-w-full">
              SlaveCode
              <span className="ml-1 text-[clamp(2.75rem,14vw,7.5rem)] leading-none text-primary/60">
                .
              </span>
>>>>>>> prod-deploy
            </h1>
          </motion.div>

          {/* Right Side: Copy & CTA */}
          <div className="flex-1 text-left w-full flex flex-col justify-center">
            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="text-3xl lg:text-4xl xl:text-5xl font-medium tracking-[-0.02em] leading-[1.2] mb-8 text-muted-foreground/70"
            >
<<<<<<< HEAD
              The <span className="text-foreground tracking-tight font-semibold">platform</span> <br className="hidden md:block"/> for elite developers.
=======
              Your{" "}
              <span className="text-foreground tracking-tight font-semibold">
                code
              </span>{" "}
              is your master. <br className="hidden md:block" /> Serve it well.
>>>>>>> prod-deploy
            </motion.h2>

            {/* Left-bordered section with paragraph and button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="border-l-2 border-border/60 pl-3 max-w-md py-1"
            >
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
<<<<<<< HEAD
                Master algorithms, compete in real-time arena Matches, and showcase
                your grit on a platform built by developers, for developers.
=======
                Stop thinking and start delivering. The industry doesn&apos;t
                want your creativity; it wants your total submission to the
                roadmap. Survive the whip of the grind and prove you have the
                grit to be a top-tier unit of labor.
>>>>>>> prod-deploy
              </p>

              <div className="flex flex-row items-start gap-4 mt-2">
                <Button asChild size="lg" className="h-11 px-6 font-semibold">
                  <Link href="/problem">
                    <Code2 className="mr-2 size-4" />
                    Problems
                  </Link>
                </Button>
<<<<<<< HEAD
                <Button asChild variant="outline" size="lg" className="h-11 px-6 font-semibold text-muted-foreground hover:text-foreground">
=======
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 font-semibold text-muted-foreground hover:text-foreground"
                >
>>>>>>> prod-deploy
                  <Link href="/compilers">
                    <Terminal className="mr-2 size-4" />
                    Compilers
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Product Mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6, ease }}
<<<<<<< HEAD
          className="max-w-7xl mx-auto md:px-8 lg:px-0"
        >
          <div
            onClick={() => router.push("/problems")}
            className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-2xl"
          >
            {/* Workspace Header — mirrors WorkspaceHeader.tsx */}
            <header className="h-14 px-4 border-b border-border/40 bg-card/20 flex items-center justify-between shrink-0">
=======
          className="max-w-7xl mx-auto"
        >
          <div
            onClick={() => router.push("/problems")}
            className="rounded-xl border border-border/60 bg-card/60 overflow-hidden ring-1 ring-border/30 shadow-[0_1px_0_hsl(var(--background)/0.6)_inset,0_0_0_1px_hsl(var(--border)/0.45),0_28px_60px_-26px_hsl(var(--foreground)/0.85),0_14px_30px_-16px_hsl(var(--foreground)/0.72)]"
          >
            {/* Workspace Header — mirrors WorkspaceHeader.tsx */}
            <header className="relative h-14 px-4 border-b border-border/40 bg-card/10 backdrop-blur-sm flex items-center shrink-0">
>>>>>>> prod-deploy
              {/* Left */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 gap-1.5 pointer-events-none opacity-60"
                >
                  <ChevronLeft className="size-3.5" />
                  <span className="hidden md:inline">Exit</span>
                </Button>
              </div>

              {/* Right — Run / Submit */}
<<<<<<< HEAD
              <div className="flex items-center gap-2 pointer-events-none opacity-70">
=======
              <ButtonGroup className="absolute left-1/2 -translate-x-1/2  pointer-events-none opacity-70">
>>>>>>> prod-deploy
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 gap-1.5"
                >
                  <Play className="size-3.5" />
                  <span className="hidden md:inline">Run</span>
                </Button>
                <Button size="sm" className="h-8 px-3 gap-1.5">
                  <Send className="size-3.5" />
                  Submit
                </Button>
<<<<<<< HEAD
              </div>
            </header>

            {/* Two-pane body */}
            <div className="grid md:grid-cols-2 min-h-[560px]">
              {/* ── LEFT PANE: Description ── */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-border/40 min-w-0">
=======
              </ButtonGroup>
            </header>

            {/* Two-pane body */}
            <div className="grid md:grid-cols-2 min-h-[560px] bg-card/10">
              {/* ── LEFT PANE: Description ── */}
              <div className="flex flex-col border-b md:border-b-0 md:border-r border-border/40 min-w-0 bg-card/10">
>>>>>>> prod-deploy
                {/* Tab bar — mirrors DescriptionPanel.tsx */}
                <div className="px-4 border-b border-border/40 bg-muted/10 overflow-x-auto">
                  <div className="flex items-center gap-4 w-max min-w-full h-10">
                    {LEFT_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        className={cn(
                          "flex items-center gap-1.5 h-full px-1 text-[11px] font-black uppercase tracking-wide border-b-2 shrink-0 transition-colors",
                          tab.id === "description"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground/40 hover:text-muted-foreground",
                        )}
                      >
                        <tab.icon className="size-3.5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description content */}
                <div className="p-5 space-y-5 overflow-hidden">
                  {/* Problem title + difficulty */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold text-foreground">
                        1. Two Sum
                      </h2>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold text-difficulty-easy border-difficulty-easy bg-difficulty-easy/5 shrink-0"
                      >
                        Easy
                      </Badge>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge className="text-[9px]">Array</Badge>
                      <Badge className="text-[9px]">Hash Table</Badge>
                    </div>
                  </div>

                  {/* Problem description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Given an array of integers nums and an integer target,
                    return indices of the two numbers such that they add up to
                    target. You may assume that each input would have exactly
                    one solution, and you may not use the same element twice.
                    You can return the answer in any order.
                  </p>

                  {/* Example block — mirrors Card from DescriptionPanel */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Example 1
                    </p>
                    <div className="rounded-lg border border-border bg-muted p-3 font-mono text-[10px] text-foreground/70 space-y-1 overflow-x-auto">
                      <p>
                        <span className="text-muted-foreground">Input:</span>
                        {"  "}nums = [2,7,11,15], target = 9
                      </p>
                      <p>
                        <span className="text-muted-foreground">Output:</span>{" "}
                        [0,1]
                      </p>
                      <p className="text-muted-foreground/50">
                        // Because nums[0] + nums[1] = 9
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Example 2
                    </p>
                    <div className="rounded-lg border border-border bg-muted p-3 font-mono text-[10px] text-foreground/70 space-y-1 overflow-x-auto">
                      <p>
                        <span className="text-muted-foreground">Input:</span>
                        {"  "}nums = [3,2,4], target = 6
                      </p>
                      <p>
                        <span className="text-muted-foreground">Output:</span>{" "}
                        [1,2]
                      </p>
                      <p className="text-muted-foreground/50">
                        // Because nums[1] + nums[2] = 6
                      </p>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      Constraints
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      {[
                        "2 <= nums.length <= 104",
                        "-109 <= nums[i] <= 109",
                        "-109 <= target <= 109",
                        "Only one valid answer exists.",
                      ].map((c) => (
                        <li
                          key={c}
                          className="text-[10px] text-muted-foreground"
                        >
                          <code className="px-1 py-0.5 rounded bg-muted/40 text-[10px]">
                            {c}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANE: Editor ── */}
<<<<<<< HEAD
              <div className="flex flex-col min-w-0">
                {/* Tab bar — mirrors EditorPanel.tsx */}
                <div className="h-14 px-3 flex items-center gap-2 border-b border-border/40 bg-muted/10">
=======
              <div className="flex flex-col min-w-0 bg-card/50">
                {/* Tab bar — mirrors EditorPanel.tsx */}
                <div className="h-14 px-3 flex items-center gap-2 border-b border-border/40 bg-card/10 backdrop-blur-sm">
>>>>>>> prod-deploy
                  {/* Language selector (left) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="font-black tracking-widest text-[10px] uppercase py-1 px-3 border-border/40 text-primary bg-primary/5 pointer-events-none"
                    >
                      JAVA
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground/40 pointer-events-none"
                    >
                      <WrapText className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground/40 pointer-events-none"
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                  </div>

                  {/* Tabs (right) — exactly mirrors EditorPanel */}
                  <Tabs defaultValue="code" className="ml-auto">
                    <TabsList className="bg-transparent h-10 p-0 gap-0">
                      {RIGHT_TABS.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className={TAB_CLS}
                        >
                          <tab.icon className="size-3 mr-1.5" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Code content — same SyntaxHighlighter as SolutionViewer.tsx */}
<<<<<<< HEAD
                <div className="flex-1 overflow-hidden">
=======
                <div className="flex-1 overflow-hidden bg-card/60">
>>>>>>> prod-deploy
                  <SyntaxHighlighter
                    language="java"
                    style={vscDarkPlus}
                    showLineNumbers
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "1.25rem",
                      fontSize: "0.73rem",
                      lineHeight: "1.8",
                      background: "transparent",
                      overflowX: "auto",
                      height: "100%",
                    }}
                    lineNumberStyle={{
                      color: "hsl(var(--muted-foreground) / 0.2)",
                      minWidth: "2rem",
                      paddingRight: "1rem",
                      userSelect: "none",
                    }}
                  >
                    {JAVA_CODE}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
