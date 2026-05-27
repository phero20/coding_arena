"use client";

import { motion } from "framer-motion";
import { type UserStats } from "@/types/stats";
import { cn } from "@/lib/utils";
import { Code2, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BadgeShowcaseProps {
  stats: UserStats;
  className?: string;
}

/**
 * BadgeShowcase: Combat Intelligence
 * Features a full 360-degree Prestige distribution donut chart natively powered by difficulty colors.
 */
export function BadgeShowcase({ stats, className }: BadgeShowcaseProps) {
  const arenaPoints = stats.arenaPoints || 0;
  const problemPoints = Math.max(0, (stats.totalPoints || 0) - arenaPoints);
  const totalPoints = stats.totalPoints || 0;
  const matches = stats.arenaGames || 0;

  const data = [
    {
      label: "Arena Points",
      count: arenaPoints,
      color: "text-difficulty-easy",
    },
    {
      label: "Problems Points",
      count: problemPoints,
      color: "text-difficulty-medium",
    },
    { label: "Total Matches", count: matches, color: "text-muted-foreground" },
  ];

  const size = 155;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 270 degree arc is 75% of circumference
  const arcLength = circumference * 0.75;
  const gap = 10; // Account for strokeLinecap radius + visible gap

  // Handle divide by zero to ensure chart doesn't break
  const safeTotal = totalPoints > 0 ? totalPoints : 1;

  const arenaTrackLen = (arenaPoints / safeTotal) * arcLength;
  const problemTrackLen = (problemPoints / safeTotal) * arcLength;

  const arenaDash = Math.max(0, arenaTrackLen - (problemPoints > 0 ? gap : 0));
  const problemDash = Math.max(
    0,
    problemTrackLen - (arenaPoints > 0 ? gap : 0),
  );

  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-center gap-12 p-3 py-4 pr-0",
        className,
      )}
    >
      {/* 1. The 270-degree Tactical Arc */}
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
            strokeOpacity={0.1}
            className="text-muted/10"
            strokeLinecap="round"
          />

          {/* [ARENA TIER - EASY COLOR] */}
          {arenaPoints > 0 && (
            <>
              {/* Arena Track Base */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="var(--difficulty-easy)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${arenaDash} ${circumference}`}
                strokeOpacity={0.1}
                className="opacity-20"
                strokeLinecap="round"
              />
              {/* Arena Progress */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="var(--difficulty-easy)"
                strokeOpacity={0.5}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${arenaDash} ${circumference}`}
                initial={{ strokeDashoffset: arenaDash }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </>
          )}

          {/* [PROBLEM TIER - MEDIUM COLOR] */}
          {problemPoints > 0 && (
            <>
              {/* Problem Track Base */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="var(--difficulty-medium)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${problemDash} ${circumference}`}
                strokeOpacity={0.1}
                className="opacity-20"
                animate={{ rotate: (arenaPoints / safeTotal) * 270 }}
                style={{ transformOrigin: "50% 50%" }}
                strokeLinecap="round"
              />
              {/* Problem Progress */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="var(--difficulty-medium)"
                strokeOpacity={0.5}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${problemDash} ${circumference}`}
                initial={{ strokeDashoffset: problemDash }}
                animate={{
                  strokeDashoffset: 0,
                  rotate: (arenaPoints / safeTotal) * 270,
                }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                style={{ transformOrigin: "50% 50%" }}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {/* Center Text Command Row */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[26px] font-black leading-none tracking-tight text-foreground">
            {totalPoints.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1.5 opacity-80">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
              Total Points
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
        {data.map((item) => (
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
              {item.count.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
