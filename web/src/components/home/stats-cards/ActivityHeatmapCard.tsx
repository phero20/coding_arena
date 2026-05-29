"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Simplified mock data generation to match production structure 1:1
const generateMockData = () => {
  const now = new Date();
  const monthsData = [];

  const getSparseSubmissions = () => {
    const roll = Math.random();
    if (roll < 0.45) return 0; // keep many cells empty
    if (roll < 0.72) return Math.floor(Math.random() * 5) + 1;
    if (roll < 0.9) return Math.floor(Math.random() * 8) + 5;
    if (roll < 0.98) return Math.floor(Math.random() * 10) + 10;
    return Math.floor(Math.random() * 6) + 20;
  };

  for (let i = 11; i >= 0; i--) {
    const monthDate = subDays(now, i * 30);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    monthsData.push({
      label: format(monthDate, "MMM"),
      days: eachDayOfInterval({ start, end }).map(date => ({
        date,
        submissions: getSparseSubmissions(),
        matches: Math.floor(Math.random() * 5),
        pointsEarned: Math.floor(Math.random() * 100),
        arenaPointsEarned: Math.floor(Math.random() * 50),
      }))
    });
  }
  return monthsData;
};

export function ActivityHeatmapCard() {
  const [hoveredDay, setHoveredDay] = useState<any>(null);
  const filteredMonthsData = generateMockData();

  // 1. Level Logic (Literal match with GritGraph.tsx)
  const getLevel = (submissions: number) => {
    if (submissions === 0) return 0;
    if (submissions < 5) return 1;
    if (submissions < 10) return 2;
    if (submissions < 20) return 3;
    return 4;
  };

  const levelColors = [
    "bg-muted/70",         // 0: Empty/Min
    "bg-[#064e3b]",        // 1: Emerald 900 (Deepest)
    "bg-[#047857]",        // 2: Emerald 700 (Dark Green)
    "bg-[#10b981]",        // 3: Emerald 500 (Vibrant Green)
    "bg-[#6ee7b7]",        // 4: Emerald 300 (Brightest - Peak)
  ];

  return (
    <Card className={cn("px-4 py-6 space-y-6 bg-card border-border/60 ring-1 ring-border/30 shadow-[0_1px_0_hsl(var(--background)/0.6)_inset,0_0_0_1px_hsl(var(--border)/0.45),0_28px_60px_-26px_hsl(var(--foreground)/0.85),0_14px_30px_-16px_hsl(var(--foreground)/0.72)] relative overflow-hidden h-full")}>
      <TooltipProvider delayDuration={0}>
        {/* Tactical Header Row - LITERAL CLONE of GritGraph.tsx */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-1">
              <span className="bg-muted px-2 py-0.5 rounded border border-border text-foreground font-bold">
                1,242
              </span>
              <span className="text-muted-foreground font-normal ml-1 whitespace-nowrap">
                submissions in the past one year
              </span>
            </h2>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent side="top">
                Submissions are recorded in the UTC timezone.
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 leading-none">
                Total active days:
              </span>
              <span className="text-xs font-bold text-foreground">
                184
              </span>
            </div>
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <span className="text-[10px] text-muted-foreground/60 leading-none">
                Current streak:
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-foreground">
                  12
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 leading-none">
                Max streak:
              </span>
              <span className="text-xs font-bold text-foreground">
                42
              </span>
            </div>

            {/* Year Navigator Select */}
            <Select defaultValue="Current">
              <SelectTrigger className="h-7 w-[100px] text-[10px] bg-muted border-border hover:bg-muted/80 transition-all font-medium">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Current" className="text-[10px] focus:bg-muted focus:text-foreground">2024</SelectItem>
                <SelectItem value="2023" className="text-[10px] focus:bg-muted focus:text-foreground">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative overflow-x-auto custom-scrollbar pb-1">
          <div className="flex items-start gap-2 min-w-max">
            {filteredMonthsData.map((month, mIdx) => (
              <div key={mIdx} className="flex flex-col gap-2">
                <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                  {month.days.map((day, dIdx) => {
                    const level = getLevel(day.submissions);
                    return (
                      <Tooltip key={dIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[9px] h-[9px] rounded-[2px] transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-foreground/20 border border-border/20",
                              levelColors[level],
                            )}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        </TooltipTrigger>
                      </Tooltip>
                    );
                  })}
                </div>
                {/* Month Label at bottom - Sync with GritGraph.tsx */}
                <span className="text-[10px] font-medium text-muted-foreground/50 text-center tracking-tighter">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-1 pointer-events-none" />
    </Card>
  );
}
