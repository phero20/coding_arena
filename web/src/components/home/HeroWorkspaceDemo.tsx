"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  { ssr: false, loading: () => <div className="animate-pulse bg-card/80 rounded-md h-full w-full" /> }
);
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/workspace-shared/editor/LanguageSelector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Code2,
  Play,
  Send,
  ChevronLeft,
  WrapText,
  RefreshCw,
  Terminal,
  Pencil,
  Clock,
  RotateCcw,
  Palette,
  User,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

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

const JAVA_CODE = `class Solution {
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

const ease = [0.16, 1, 0.3, 1] as const;

export const HeroWorkspaceDemo = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.6, ease }}
      className="relative max-w-7xl mx-auto w-full transition-shadow mt-12 pointer-events-none"
      onClick={() => router.push("/problems")}
    >
      <Card className="relative flex min-h-[600px] md:h-[700px] flex-col border border-border/40 bg-background shadow-none opacity-90 pointer-events-none overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden border-b border-border/40">
          {/* Workspace Header */}
          <header className="relative flex h-14 items-center border-b border-border/40 bg-card/20 px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex h-8 items-center gap-1.5 px-3 opacity-60">
                <ChevronLeft className="size-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Exit</span>
              </Button>
            </div>

            <ButtonGroup className="absolute left-1/2 -translate-x-1/2 opacity-80">
              <Button variant="outline" size="sm" className="hidden md:flex h-8 px-3 gap-1.5 ">
                <Pencil className="size-3.5" />
                <span className="hidden md:inline">Scratchpad</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 gap-1.5 ">
                <Play className="size-3.5" />
                <span className="hidden md:inline">Run</span>
              </Button>
              <Button size="sm" className="h-8 px-3 gap-1.5">
                <Send className="size-3.5" />
                Submit
              </Button>
            </ButtonGroup>

            {/* Right: Timer, Palette, Avatar */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3 opacity-80">
              <div className="hidden lg:flex items-center gap-3 h-8 px-3 rounded-md border border-border/40 bg-card text-[11px] font-bold font-mono tracking-wider">
                <Clock className="size-3 text-muted-foreground" /> 
                <span>09:06</span>
                <Play className="size-3 text-foreground hover:text-primary transition-colors fill-current" />
                <RotateCcw className="size-3 text-foreground hover:text-primary transition-colors" />
              </div>
              <Button variant="outline" size="icon" className="size-8 rounded-full border-border/40 pointer-events-none hover:bg-transparent">
                <Palette className="size-3.5 text-primary" />
              </Button>
              <Avatar className="size-8 border border-border/40">
                <AvatarFallback className="text-primary-foreground text-[10px]">
                  <User className="size-3.5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Two-pane body */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40 overflow-hidden">
            {/* ── LEFT PANE: Description ── */}
            <div className="flex flex-col min-w-0 bg-card/10">
              {/* Tab bar */}
              <div className="px-4 border-b border-border/40 bg-muted/20 shrink-0">
                <div className="flex items-center gap-4 w-max min-w-full h-10 overflow-x-auto">
                  {LEFT_TABS.map((tab) => (
                    <div
                      key={tab.id}
                      className={cn(
                        "flex items-center gap-1.5 h-full px-1 text-[10px] font-black uppercase tracking-wide border-b-2 shrink-0 transition-colors whitespace-nowrap",
                        tab.id === "description"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground/40 hover:text-muted-foreground",
                      )}
                    >
                      <tab.icon className="size-3.5" />
                      <span className="hidden lg:inline">{tab.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description content */}
              <div className="p-5 space-y-5 overflow-y-auto hide-scrollbar">
                {/* Problem title + difficulty */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-foreground">
                      1. Two Sum
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold text-difficulty-easy border-difficulty-easy bg-difficulty-easy/5 shrink-0"
                    >
                      Easy
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge className="text-[8px] h-4">Array</Badge>
                    <Badge className="text-[8px] h-4">Hash Table</Badge>
                  </div>
                </div>

                {/* Problem description */}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Given an array of integers nums and an integer target,
                  return indices of the two numbers such that they add up to
                  target. You may assume that each input would have exactly
                  one solution, and you may not use the same element twice.
                  You can return the answer in any order.
                </p>

                {/* Example block */}
                <div className="space-y-2 pt-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Example 1
                  </p>
                  <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-[10px] text-foreground/70 space-y-1">
                    <p>
                      <span className="text-muted-foreground">Input:</span>
                      {"  "}nums = [2,7,11,15], target = 9
                    </p>
                    <p>
                      <span className="text-muted-foreground">Output:</span>{" "}
                      [0,1]
                    </p>
                    <p className="text-muted-foreground/40">
                      // Because nums[0] + nums[1] = 9
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Example 2
                  </p>
                  <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-[10px] text-foreground/70 space-y-1">
                    <p>
                      <span className="text-muted-foreground">Input:</span>
                      {"  "}nums = [3,2,4], target = 6
                    </p>
                    <p>
                      <span className="text-muted-foreground">Output:</span>{" "}
                      [1,2]
                    </p>
                    <p className="text-muted-foreground/40">
                      // Because nums[1] + nums[2] = 6
                    </p>
                  </div>
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
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
            <div className="flex flex-col min-w-0 bg-card/80">
              {/* Tab bar */}
              <div className="h-12 px-3 flex items-center gap-2 border-b border-border/40 bg-card/20 shrink-0">
                {/* Language selector (left) */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LanguageSelector
                    value="java"
                    onChange={() => {}}
                    languages={[{ id: "java", name: "JAVA" }, { id: "javascript", name: "JAVASCRIPT" }, { id: "python", name: "PYTHON" }]}
                  />
                  <div className="size-7 rounded border border-border/60 flex items-center justify-center text-primary">
                    <WrapText className="size-3" />
                  </div>
                  <div className="size-7 flex items-center justify-center">
                    <RefreshCw className="size-3" />
                  </div>
                </div>

                {/* Tabs (right) */}
                <Tabs defaultValue="code" className="ml-auto">
                  <TabsList className="bg-transparent h-10 p-0 gap-0">
                    {RIGHT_TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={TAB_CLS}
                      >
                        <tab.icon className="size-3 mr-1.5" />
                        <span className="hidden lg:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Code content */}
              <div className="flex-1 relative bg-card/80 overflow-y-auto">
                <SyntaxHighlighter
                  language="java"
                  style={vscDarkPlus}
                  showLineNumbers
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "0.75rem",
                    fontSize: "0.75rem",
                    lineHeight: "1.7",
                    background: "transparent",
                    height: "100%",
                  }}
                  lineNumberStyle={{
                    color: "hsl(var(--muted-foreground) / 0.2)",
                    minWidth: "1.5rem",
                    paddingRight: "0.75rem",
                    userSelect: "none",
                  }}
                >
                  {JAVA_CODE}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="absolute inset-x-0 -bottom-10 md:-bottom-20 flex flex-col items-center justify-end bg-gradient-to-t from-background via-background/95 to-transparent pt-60 pb-4 md:pb-12 z-30 pointer-events-auto">
        <h3 className="text-2xl md:text-3xl text-center font-bold text-foreground mb-4 tracking-tight">
          Master 3000+ Real Interview Problems
        </h3>
        <p className="text-foreground/80 text-sm md:text-base text-center max-w-3xl leading-relaxed mb-6 px-4">
          Everything you need to master your coding skills. From <span className="text-foreground font-medium underline decoration-primary underline-offset-4">basic arrays</span> to <span className="text-foreground font-medium underline decoration-primary underline-offset-4">complex dynamic programming</span>, practice in a fully-featured, <span className="text-foreground font-medium underline decoration-primary underline-offset-4">distraction-free</span> environment.
        </p>
        <Button
          variant="link"
          className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
          asChild
        >
          <Link href="/problems">
            Explore All Problems <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};
