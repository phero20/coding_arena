"use client";

import {
  ChevronLeft, Clock, Play, Send, BookOpen, HelpCircle, Users, WrapText,
  RefreshCw, Code2, Terminal, CircleCheck,
  Pencil,
  Settings,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export const ArenaHomeEditorSection = () => {
  return (
    <div className="w-full mt-12 relative pointer-events-none">
      <Card className="relative flex min-h-[600px] md:h-[700px] flex-col border border-border/40  bg-background shadow-none  rounded-xl opacity-90 pointer-events-none">
        <div className="flex flex-1 flex-col overflow-hidden border-b border-border/40">
          <header className="relative flex h-14 items-center border-b border-border/40 bg-card/20 px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex h-8 items-center gap-1.5 px-3 ">
                <ChevronLeft className="size-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Exit</span>
              </Button>
            </div>

            <Badge className="absolute left-1/2 -translate-x-1/2 text-foreground h-8 px-3 border border-border/40 bg-card flex items-center gap-1.5 shadow">
              <Clock className="size-3" />
              <span className="text-[10px] font-black tracking-widest ">
                09:06
              </span>
            </Badge>

            <ButtonGroup className="ml-auto flex items-center ">
              <Button variant="outline" className="hidden md:flex h-8 items-center gap-1.5 rounded border border-border/40 px-3">
                <Pencil className="size-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Scratchpad</span>
              </Button>
              <Button variant="outline" className="flex h-8 items-center gap-1.5 rounded border border-border/40 px-3">
                <Play className="size-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Run</span>
              </Button>
              <Button className="flex h-8 items-center gap-1.5 rounded px-3 text-[11px] font-bold text-primary-foreground">
                <Send className="size-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Submit</span>
              </Button>
            </ButtonGroup>
          </header>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40 overflow-hidden">
            <div className="flex flex-col min-w-0 bg-card/10">
              <div className="px-4 border-b border-border/40 bg-muted/20 shrink-0">
                <div className="flex items-center gap-4 h-10 overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-1.5 h-full px-1 text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary shrink-0">
                    <BookOpen className="size-3.5" />
                  </div>
                  {[
                    { label: "Hints", icon: HelpCircle },
                    { label: "Participants", icon: Users },
                  ].map((tab) => (
                    <div
                      key={tab.label}
                      className="flex items-center gap-1.5 h-full px-1 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/40 shrink-0 whitespace-nowrap"
                    >
                      <tab.icon className="size-3.5" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 space-y-5 overflow-y-auto hide-scrollbar">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-foreground">
                      1. Two Sum
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold text-difficulty-easy border-difficulty-easy bg-difficulty-easy/5"
                    >
                      Easy
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge className="text-[8px] h-4">Array</Badge>
                    <Badge className="text-[8px] h-4">Hash Table</Badge>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Given an array of integers nums and an integer target, return indices
                  of the two numbers such that they add up to target. You may assume
                  each input has exactly one solution, and you may not use the same
                  element twice. You can return the answer in any order.
                </p>

                <div className="space-y-2 pt-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Example 1
                  </p>
                  <div className="rounded-lg border border-border bg-muted/50 p-3 font-mono text-[10px] text-foreground/70 space-y-1">
                    <p>
                      <span className="text-muted-foreground">Input:</span>{" "}
                      nums = [2,7,11,15], target = 9
                    </p>
                    <p>
                      <span className="text-muted-foreground">Output:</span> [0,1]
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
                      <span className="text-muted-foreground">Input:</span>{" "}
                      nums = [3,2,4], target = 6
                    </p>
                    <p>
                      <span className="text-muted-foreground">Output:</span> [1,2]
                    </p>
                    <p className="text-muted-foreground/40">
                      // Because nums[1] + nums[2] = 6
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Constraints
                  </p>
                  <ul className="space-y-1 list-disc list-inside">
                    {[
                      "2 <= nums.length <= 104",
                      "-109 <= nums[i] <= 109",
                      "-109 <= target <= 109",
                    ].map((constraint) => (
                      <li key={constraint} className="text-[10px] text-muted-foreground">
                        <code className="px-1 py-0.5 rounded bg-muted/40 text-[10px]">
                          {constraint}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col min-w-0 bg-card/80">
              <div className="h-12 px-3 flex items-center gap-2 border-b border-border/40 bg-card/20 shrink-0">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="font-black tracking-widest text-[9px] uppercase py-0.5 px-2 border-border/40 text-primary bg-primary/5"
                  >
                    JAVA
                  </Badge>
                  <div className="size-7 rounded border border-border/60 flex items-center justify-center  text-primary">
                    <WrapText className="size-3" />
                  </div>
                  <div className="size-7  flex items-center justify-center ">
                    <RefreshCw className="size-3" />
                  </div>
                  <div className="size-7  flex items-center justify-center ">
                    <Settings className="size-3" />
                  </div>
                </div>
                <div className="ml-auto flex items-center h-full">
                  <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-primary text-primary">
                    <Code2 className="size-3 mr-1" />
                    <span className="hidden sm:inline">Code</span>
                  </div>
                  <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/30">
                    <Terminal className="size-3 mr-1" />
                    <span className="hidden sm:inline">Tests</span>
                  </div>
                  <div className="flex items-center gap-1.5 h-full px-3 text-[10px] font-black uppercase tracking-wide border-b-2 border-transparent text-muted-foreground/30">
                    <CircleCheck className="size-3 mr-1" />
                    <span className="hidden sm:inline">Result</span>
                  </div>
                </div>
              </div>

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
        <h3 className="text-2xl text-center font-bold text-foreground mb-4 tracking-tight">
          Fully-Featured Competitive Editor
        </h3>
        <p className="text-foreground/80 text-sm text-center max-w-3xl leading-relaxed mb-6">
          Everything you need to dominate the match. Utilize the <span className="text-foreground font-medium underline decoration-primary underline-offset-4">built-in scratchpad</span>, keep pace with the <span className="text-foreground font-medium underline decoration-primary underline-offset-4">live match timer</span>, leverage instant <span className="text-foreground font-medium underline decoration-primary underline-offset-4">test execution</span>, and keep an eye on your competition with <span className="text-foreground font-medium underline decoration-primary underline-offset-4">real-time tracking</span>.
        </p>
        <Button
          variant="link"
          className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
          asChild
        >
          <Link href="/arena">
            Enter the Arena <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
