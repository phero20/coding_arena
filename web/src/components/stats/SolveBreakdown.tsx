import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { type UserStats } from "@/types/stats";
import { cn } from "@/lib/utils";
import { Check, Code2, Swords, GraduationCap } from "lucide-react";
import { Card } from "../ui/card";
import { useDifficultyMetrics } from "@/hooks/stats/use-difficulty-metrics";
import { useSolvedExercisesQuery } from "@/hooks/queries/use-academy.queries";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

interface SolveBreakdownProps {
  stats: UserStats;
  className?: string;
}

export function SolveBreakdown({ stats, className }: SolveBreakdownProps) {
  const [viewMode, setViewMode] = useState<"arena" | "academy">("arena");
  const { data: academySolved } = useSolvedExercisesQuery("all");

  const size = 155;
  const strokeWidth = 6;
  const gap = 10;

  const arenaMetrics = useDifficultyMetrics({ stats, size, strokeWidth, gap });

  const currentSegments = useMemo(() => {
    if (viewMode === "arena") {
      return arenaMetrics.segments;
    }

    const count = academySolved?.length || 0;
    const total = 7787;
    const progress = total > 0 ? (count / total) * arenaMetrics.arcLength : 0;

    return [
      {
        id: "academy",
        label: "Academy",
        count,
        total,
        color: "text-difficulty-medium",
        cssVar: "var(--difficulty-medium)",
        trackLen: arenaMetrics.arcLength,
        progress,
        rotate: 0,
      },
    ];
  }, [viewMode, arenaMetrics, academySolved]);

  const currentTotalSolved =
    viewMode === "arena" ? arenaMetrics.totalSolved : academySolved?.length || 0;
  const currentGlobalTotal = viewMode === "arena" ? arenaMetrics.globalTotal : 7787;
  const bottomLabel = viewMode === "arena" ? "SlaveCode" : "Academy";

  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center  p-3 pt-6 md:pt-3  relative",
        className,
      )}
    >
      <ButtonGroup className="absolute top-2 left-2 flex bg-muted/60 p-0.5 rounded-md items-center gap-0.5 z-10 shadow">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("arena")}
          className={cn(
            "h-6 w-6 rounded-sm transition-colors",
            viewMode === "arena"
              && "bg-background text-primary"
          )}
          title="Arena Stats"
        >
          <Code2 size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode("academy")}
          className={cn(
            "h-6 w-6 rounded-sm transition-colors",
            viewMode === "academy" &&  "bg-background text-primary"
          )}
          title="Academy Stats"
        >
          <GraduationCap size={12} />
        </Button>
      </ButtonGroup>

      <div className="flex flex-row items-center justify-center gap-12 w-full pr-0 mt-2">
        {/* 1. The Tactical Arc System */}
        <div className="relative flex flex-col items-center justify-center shrink-0 mt-2">
          <svg width={size} height={size} className="transform rotate-140">
            {/* Global Background Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={arenaMetrics.radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${arenaMetrics.arcLength} ${arenaMetrics.circumference}`}
              className="text-muted/10"
              strokeLinecap="round"
            />

            {currentSegments.map((segment) => (
              <React.Fragment key={segment.id}>
                {/* Segment Track */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={arenaMetrics.radius}
                  stroke={segment.cssVar}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${segment.trackLen - (viewMode === "arena" ? gap : 0)} ${arenaMetrics.circumference}`}
                  className="opacity-20"
                  animate={{ rotate: segment.rotate }}
                  strokeLinecap="round"
                />
                {/* Segment Progress */}
                {segment.count > 0 && (
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={arenaMetrics.radius}
                    stroke={segment.cssVar}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${segment.progress} ${arenaMetrics.circumference}`}
                    initial={{ strokeDashoffset: segment.progress }}
                    animate={{
                      strokeDashoffset: 0,
                      rotate: segment.rotate,
                    }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                )}
              </React.Fragment>
            ))}
          </svg>

          {/* Center Text Command Row */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-bold leading-none tracking-tight">
              {currentTotalSolved}
              <span className="text-sm text-muted-foreground ml-0.5 font-normal">
                /{currentGlobalTotal}
              </span>
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <Check size={12} className="text-difficulty-easy" />
              <span className="text-[10px] font-medium text-foreground">
                Solved
              </span>
            </div>
          </div>

          {/* Base Status Label */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-0.5 whitespace-nowrap transition-colors">
              <Code2 size={12} className={viewMode === "arena" ? "text-difficulty-medium" : "text-primary"} />
              <p className={cn("text-[9px] uppercase font-bold tracking-widest leading-none translate-y-[1.5px]", viewMode === "arena" ? "text-muted-foreground group-hover/card:text-difficulty-medium" : "text-muted-foreground group-hover/card:text-primary")}>
                {bottomLabel}
              </p>
            </div>
          </div>
        </div>

        {/* 2. The Triple-Box Vertical Stack */}
        <div className="flex-1 w-full max-w-[130px] space-y-1">
          {currentSegments.map((item) => (
            <div
              key={item.label}
              className="p-2 rounded-lg bg-muted/50 border border-border/10 flex flex-col items-center justify-center text-center hover:bg-muted/60 transition-colors"
            >
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase mb-1",
                  item.color,
                )}
              >
                {item.label}
              </span>
              <p className="text-xs font-bold leading-none">
                {item.count}
                <span className="text-[10px] text-muted-foreground ml-0.5 font-normal">
                  /{item.total}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
