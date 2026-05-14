"use client";

import { motion } from "framer-motion";
import { type UserStats } from "@/types/stats";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Card } from "../ui/card";

interface SolveBreakdownProps {
  stats: UserStats;
  className?: string;
}

/**
 * SolveBreakdown: High-Fidelity Tactical Hero Overhaul.
 * Nested progress version: Segments sized by total pool, inner arcs show solved conquest.
 */
export function SolveBreakdown({ stats, className }: SolveBreakdownProps) {
  const { easySolved, mediumSolved, hardSolved, totalSolved } = stats;

  // LeetCode Total Question Pools (Architectural Context)
  const TOTAL_EASY = 935;
  const TOTAL_MED = 2037;
  const TOTAL_HARD = 921;
  const GRAND_TOTAL = TOTAL_EASY + TOTAL_MED + TOTAL_HARD;

  const data = [
    {
      label: "Easy",
      count: easySolved,
      total: TOTAL_EASY,
      color: "text-difficulty-easy",
    },
    {
      label: "Med.",
      count: mediumSolved,
      total: TOTAL_MED,
      color: "text-difficulty-medium",
    },
    {
      label: "Hard",
      count: hardSolved,
      total: TOTAL_HARD,
      color: "text-difficulty-hard",
    },
  ];

  const size = 155;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 270 degree arc is 75% of circumference
  const arcLength = circumference * 0.75;
  const gap = 10; // Account for strokeLinecap radius + visible gap

  // Calculate track ratios based on total pool size
  const easyTrackLen = (TOTAL_EASY / GRAND_TOTAL) * arcLength;
  const medTrackLen = (TOTAL_MED / GRAND_TOTAL) * arcLength;
  const hardTrackLen = (TOTAL_HARD / GRAND_TOTAL) * arcLength;

  // Calculate progress within each track
  const easyProgress = (easySolved / TOTAL_EASY) * easyTrackLen;
  const medProgress = (mediumSolved / TOTAL_MED) * medTrackLen;
  const hardProgress = (hardSolved / TOTAL_HARD) * hardTrackLen;

  return (
    <Card
      className={cn(
        "flex flex-row items-center justify-center gap-12 p-3 pr-0",
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
            className="text-muted/10"
            strokeLinecap="round"
          />

          {/* [EASY TIER] */}
          {/* Easy Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--difficulty-easy)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${easyTrackLen - gap} ${circumference}`}
            className="opacity-20"
            strokeLinecap="round"
          />
          {/* Easy Progress */}
          {easySolved > 0 && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--difficulty-easy)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${easyProgress} ${circumference}`}
              initial={{ strokeDashoffset: easyProgress }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          )}

          {/* [MEDIUM TIER] */}
          {/* Medium Track */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--difficulty-medium)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${medTrackLen - gap} ${circumference}`}
            className="opacity-20"
            animate={{ rotate: (TOTAL_EASY / GRAND_TOTAL) * 270 }}
            strokeLinecap="round"
          />
          {/* Medium Progress */}
          {mediumSolved > 0 && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--difficulty-medium)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${medProgress} ${circumference}`}
              initial={{ strokeDashoffset: medProgress }}
              animate={{
                strokeDashoffset: 0,
                rotate: (TOTAL_EASY / GRAND_TOTAL) * 270,
              }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          )}

          {/* [HARD TIER] */}
          {/* Hard Track */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--difficulty-hard)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${hardTrackLen - gap} ${circumference}`}
            className="opacity-20"
            animate={{ rotate: ((TOTAL_EASY + TOTAL_MED) / GRAND_TOTAL) * 270 }}
            strokeLinecap="round"
          />
          {/* Hard Progress */}
          {hardSolved > 0 && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--difficulty-hard)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${hardProgress} ${circumference}`}
              initial={{ strokeDashoffset: hardProgress }}
              animate={{
                strokeDashoffset: 0,
                rotate: ((TOTAL_EASY + TOTAL_MED) / GRAND_TOTAL) * 270,
              }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Center Text Command Row */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold leading-none tracking-tight">
            {totalSolved}
            <span className="text-sm text-muted-foreground ml-0.5 font-normal">
              /3888
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
              {item.label === "Med." ? "Medium" : item.label}
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
