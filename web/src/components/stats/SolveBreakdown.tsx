import React from "react";
import { motion } from "framer-motion";
import { type UserStats } from "@/types/stats";
import { cn } from "@/lib/utils";
import { Check, Code2 } from "lucide-react";
import { Card } from "../ui/card";
import { useDifficultyMetrics } from "@/hooks/stats/use-difficulty-metrics";

interface SolveBreakdownProps {
  stats: UserStats;
  className?: string;
}

export function SolveBreakdown({ stats, className }: SolveBreakdownProps) {
  const size = 155;
  const strokeWidth = 6;
  const gap = 10;

  const {
    radius,
    circumference,
    arcLength,
    segments,
    totalSolved,
    globalTotal,
  } = useDifficultyMetrics({ stats, size, strokeWidth, gap });

  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-center gap-12 p-3 pr-0",
        className,
      )}
    >
      {/* 1. The Tactical Arc System */}
      <div className="relative flex flex-col items-center justify-center shrink-0 mt-2">
        <svg width={size} height={size} className="transform rotate-140">
          {/* Global Background Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-muted/10"
            strokeLinecap="round"
          />

          {segments.map((segment) => (
            <React.Fragment key={segment.id}>
              {/* Segment Track */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.cssVar}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${segment.trackLen - gap} ${circumference}`}
                className="opacity-20"
                animate={{ rotate: segment.rotate }}
                strokeLinecap="round"
              />
              {/* Segment Progress */}
              {segment.count > 0 && (
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={segment.cssVar}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${segment.progress} ${circumference}`}
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
            {totalSolved}
            <span className="text-sm text-muted-foreground ml-0.5 font-normal">
              /{globalTotal}
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
          <div className="flex items-center gap-0.5 whitespace-nowrap  transition-colors  ">
            <Code2 size={12} className="text-difficulty-medium" />
            <p className="text-[9px] text-muted-foreground group-hover/card:text-difficulty-medium uppercase font-bold tracking-widest leading-none translate-y-[1.5px]">
              SlaveCode
            </p>
          </div>
        </div>
      </div>

      {/* 2. The Triple-Box Vertical Stack */}
      <div className="flex-1 w-full max-w-[130px] space-y-1">
        {segments.map((item) => (
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
    </Card>
  );
}
