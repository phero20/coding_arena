import React from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function SolveBreakdownCard() {
  const size = 155;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const gap = 10;
  
  const segments = [
    { id: "easy", label: "Easy", count: 408, total: 850, color: "text-difficulty-easy", cssVar: "var(--difficulty-easy)", trackLen: arcLength * 0.5, progress: arcLength * 0.2, rotate: 0 },
    { id: "medium", label: "Medium", count: 692, total: 1621, color: "text-difficulty-medium", cssVar: "var(--difficulty-medium)", trackLen: arcLength * 0.3, progress: arcLength * 0.1, rotate: 135 },
    { id: "hard", label: "Hard", count: 120, total: 720, color: "text-difficulty-hard", cssVar: "var(--difficulty-hard)", trackLen: arcLength * 0.2, progress: arcLength * 0.04, rotate: 216 },
  ];

  const totalSolved = 1220;
  const globalTotal = 3191;

  return (
    <Card className="flex flex-row items-center justify-center gap-12 p-3 pr-0 h-full bg-card/20 border-border/60 ring-1 ring-border/30 shadow-[0_1px_0_hsl(var(--background)/0.6)_inset,0_0_0_1px_hsl(var(--border)/0.45),0_28px_60px_-26px_hsl(var(--foreground)/0.85),0_14px_30px_-16px_hsl(var(--foreground)/0.72)]">
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
          <p className="text-[9px] text-muted-foreground uppercase whitespace-nowrap">
            <span className="text-foreground font-semibold mr-1">4</span>{" "}
            Attempting
          </p>
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
