"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// Mimic of the TaxonomyNode using exact shadcn colors
const MockRoadmapNode = ({
  id,
  title,
  solved,
  total,
  className
}: {
  id: string;
  title: string;
  solved: number;
  total: number;
  className?: string;
}) => {
  const percent = total > 0 ? Math.min(100, (solved / total) * 100) : 0;

  return (
    <Card id={id} className={cn("relative z-10 w-[110px] sm:w-[180px] lg:w-[140px] xl:w-[180px] p-2 sm:p-3 flex flex-col gap-2 border-2 border-border rounded-2xl", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-foreground text-[11px] sm:text-[13px] tracking-tight truncate pr-1 sm:pr-2">{title}</h4>
        <div className="bg-muted rounded-full p-0.5 shrink-0 hidden sm:block">
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 ">
        <div className="flex-1 h-[4px] bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-muted-foreground shrink-0 hidden sm:block">
          {solved} / {total}
        </span>
      </div>
    </Card>
  );
};

export const RoadmapHomeSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background py-20 sm:py-28 border-b">
      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">

        {/* Centered Roadmap Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Roadmap
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Master Data Structures and Algorithms in the perfect sequence.<br className="hidden sm:block" />
            Track your progress as you unlock concepts from basic Arrays to advanced Graph theory.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">



          {/* Text Content (Left Side) */}
          <div className="flex flex-col items-start text-left max-w-2xl lg:pr-10 relative z-30 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
              Master Data Structures <br className="hidden md:block" />
              <span className="text-primary">and Algorithms</span>
            </h2>

            <div className="flex flex-col gap-6 text-lg text-muted-foreground leading-relaxed mb-6">
              <p>
                Stop guessing what to learn next. Our interactive taxonomy roadmaps guide you through every concept of DSA in a highly structured, logical order.
              </p>
              <p>
                Navigate through clearly defined subtopics from basic Arrays to complex Trees and Tries. Each topic is paired with targeted practice problems, allowing you to solve questions and track your true mastery as you conquer every node on the path.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center relative z-30">
              <Button
                variant="link"
                className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
                asChild
              >
                <Link href="/roadmap">
                  View full roadmap <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>

          </div>
          {/* Right Side: Exact Mimic Graph without container card */}
          <div className="relative w-full flex flex-col justify-center items-center h-[500px] sm:h-[700px] overflow-hidden order-1 lg:order-2">

            <div className="relative w-full h-full flex flex-col items-center justify-between py-12 pointer-events-none opacity-90">
              <Xwrapper>
                {/* Row 1 */}
                <div className="flex justify-center w-full">
                  <MockRoadmapNode id="arrays" title="Arrays" solved={3} total={21} />
                </div>

                {/* Row 2 */}
                <div className="flex justify-center gap-6 sm:gap-[120px] lg:gap-8 xl:gap-[120px] w-full">
                  <MockRoadmapNode id="stacks" title="Stacks" solved={0} total={25} />
                  <MockRoadmapNode id="strings" title="Strings" solved={0} total={18} />
                </div>

                {/* Row 3 */}
                <div className="flex justify-center gap-2 sm:gap-8 lg:gap-2 xl:gap-8 w-full">
                  <MockRoadmapNode id="linked-lists" title="LINKED LISTS" solved={22} total={0} />
                  <MockRoadmapNode id="queue-deque" title="QUEUE / DEQUE" solved={15} total={0} />
                  <MockRoadmapNode id="hash-map" title="Hash map" solved={0} total={32} />
                </div>

                {/* Row 4 */}
                <div className="flex justify-center w-full">
                  <MockRoadmapNode id="trees" title="TREES" solved={0} total={20} />
                </div>

                {/* Row 5 */}
                <div className="flex justify-center gap-8 sm:gap-[160px] lg:gap-12 xl:gap-[160px] w-full">
                  <MockRoadmapNode id="recursion" title="Recursion" solved={0} total={12} />
                  <MockRoadmapNode id="trie" title="TRIE" solved={0} total={10} />
                </div>

                {/* Edges */}
                {[
                  { source: "arrays", target: "stacks" },
                  { source: "arrays", target: "strings" },
                  { source: "stacks", target: "linked-lists" },
                  { source: "strings", target: "queue-deque" },
                  { source: "strings", target: "hash-map" },
                  { source: "linked-lists", target: "trees" },
                  { source: "queue-deque", target: "trees" },
                  { source: "hash-map", target: "trees" },
                  { source: "trees", target: "recursion" },
                  { source: "trees", target: "trie" },
                ].map((e) => (
                  <Xarrow
                    key={`${e.source}-${e.target}`}
                    start={e.source}
                    end={e.target}
                    color="currentColor"
                    strokeWidth={2}
                    showHead={false}
                    path="smooth"
                    startAnchor="bottom"
                    endAnchor="top"
                    passProps={{
                      className: "text-primary opacity-30",
                      style: { pointerEvents: "none" }
                    }}
                  />
                ))}
              </Xwrapper>
            </div>


            <div className="absolute inset-x-0 bottom-0 h-96 bg-linear-to-t from-background via-background/70 to-background/20 z-20 pointer-events-none" />

          </div>
        </div>
      </div>
    </section>
  );
};
