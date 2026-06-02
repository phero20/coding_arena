import React from "react";
import { motion } from "framer-motion";
import { type LeetCodeStats } from "@/types/stats";
import { cn } from "@/lib/utils";
import { Check, Code2 } from "lucide-react";
import { Card } from "../ui/card";
import { useLeetCodeMetrics } from "@/hooks/stats/use-leetcode-metrics";

interface LeetCodeSolveBreakdownProps {
  stats: LeetCodeStats;
  username: string;
  className?: string;
}

export function LeetCodeSolveBreakdown({ stats, username, className }: LeetCodeSolveBreakdownProps) {
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
  } = useLeetCodeMetrics({ stats, size, strokeWidth, gap });

  return (
    <a 
      href={`https://leetcode.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline"
    >
      <Card
        className={cn(
          "flex flex-row items-center justify-center gap-12 p-3 pt-6 pb-2 relative cursor-pointer hover:bg-muted/40 transition-all active:scale-[0.99] group/card",
          className,
        )}
      >
        {/* Top Left Branding */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground group-hover/card:text-difficulty-medium transition-colors leading-none">
          <Code2 size={12} className="text-difficulty-medium shrink-0" />
          <span className="translate-y-[0.5px]">{username}</span>
        </div>

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
          <div className="flex items-center gap-0.5 whitespace-nowrap transition-colors">
            <Code2 size={12} className="text-difficulty-medium shrink-0" />
            <p className="text-[9px] text-muted-foreground group-hover/card:text-difficulty-medium uppercase font-bold tracking-widest leading-none translate-y-[1.5px]">
              Leetcode
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
    </a>
  );
}
