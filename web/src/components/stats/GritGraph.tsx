"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type UserActivityLog, type UserStats } from "@/types/stats";
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
import { useActivityTimeline } from "@/hooks/stats/use-activity-timeline";

interface GritGraphProps {
  activityLog: UserActivityLog[];
  stats: UserStats;
  joinedAt: string;
  className?: string;
}

export function GritGraph({
  activityLog,
  stats,
  joinedAt,
  className,
}: GritGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<UserActivityLog | null>(null);

  const {
    selectedYear,
    setSelectedYear,
    yearOptions,
    totalSubmissions,
    activeDays,
    filteredMonthsData,
  } = useActivityTimeline({ activityLog, joinedAt });

  // 1. Level Logic
  const getLevel = (submissions: number) => {
    if (submissions === 0) return 0;
    if (submissions < 5) return 1;
    if (submissions < 10) return 2;
    if (submissions < 20) return 3;
    return 4;
  };

  const levelColors = [
    "bg-background/50",         // 0: Empty/Min
    "bg-[#064e3b]",        // 1: Emerald 900 (Deepest)
    "bg-[#047857]",        // 2: Emerald 700 (Dark Green)
    "bg-[#10b981]",        // 3: Emerald 500 (Vibrant Green)
    "bg-[#6ee7b7]",        // 4: Emerald 300 (Brightest - Peak)
  ];

  return (
    <Card
      className={cn("px-4 py-5 space-y-5 bg-card border-border", className)}
    >
      <TooltipProvider delayDuration={0}>
        {/* Tactical Header Row */}
        <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-1">
              <span className="bg-muted px-2 py-0.5 rounded border border-border text-foreground font-bold">
                {totalSubmissions.toLocaleString()}
              </span>
              <span className="text-muted-foreground font-normal ml-1 whitespace-nowrap">
                submissions in{" "}
                {selectedYear === "Current"
                  ? "the past one year"
                  : selectedYear}
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
                {activeDays}
              </span>
            </div>
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <span className="text-[10px] text-muted-foreground/60 leading-none">
                Current streak:
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-foreground">
                  {stats.currentStreak}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 leading-none">
                Max streak:
              </span>
              <span className="text-xs font-bold text-foreground">
                {selectedYear === "Current" ? stats.bestStreak : "—"}
              </span>
            </div>

            {/* Year Navigator Select */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-7 w-[100px] text-[10px] bg-muted border-border hover:bg-muted/80 transition-all font-medium shadow-none">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {yearOptions.map((year) => (
                  <SelectItem
                    key={year}
                    value={year}
                    className="text-[10px] focus:bg-muted focus:text-foreground"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative overflow-x-auto custom-scrollbar pb-1">
          <div className="flex items-start gap-2 min-w-max">
            {filteredMonthsData.map((month, mIdx) => (
              <div key={mIdx} className="flex flex-col gap-2">
                <div className="grid grid-rows-7 grid-flow-col gap-[2.5px]">
                  {month.days.map((day, dIdx) => {
                    const level = getLevel(day.submissions);
                    return (
                      <Tooltip key={dIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[10px] h-[10px] rounded-[2px] transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-foreground/20 border border-border/20",
                              levelColors[level],
                            )}
                            onMouseEnter={() =>
                              setHoveredDay({
                                userId: stats.userId,
                                date: format(day.date, "yyyy-MM-dd"),
                                submissions: day.submissions,
                                matches: day.matches,
                                pointsEarned: day.pointsEarned,
                                arenaPointsEarned: day.arenaPointsEarned,
                              })
                            }
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="p-3 border border-border/50 bg-popover min-w-[150px] shadow-xl"
                        >
                          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-b border-border/50 pb-2 mb-2">
                            {format(day.date, "MMM dd, yyyy")}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground font-medium">
                                Submissions
                              </span>
                              <span className="font-bold text-foreground">
                                {day.submissions}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground font-medium">
                                Arena Matches
                              </span>
                              <span className="font-bold text-foreground">
                                {day.matches}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground font-medium">
                                Problems Points
                              </span>
                              <span
                                className={cn(
                                  "font-bold",
                                  day.pointsEarned - day.arenaPointsEarned > 0
                                    ? "text-difficulty-easy"
                                    : "text-muted-foreground/40",
                                )}
                              >
                                {day.pointsEarned - day.arenaPointsEarned > 0
                                  ? `+${day.pointsEarned - day.arenaPointsEarned}`
                                  : "0"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground font-medium">
                                Arena Points
                              </span>
                              <span
                                className={cn(
                                  "font-bold",
                                  day.arenaPointsEarned > 0
                                    ? "text-difficulty-easy"
                                    : "text-muted-foreground/40",
                                )}
                              >
                                {day.arenaPointsEarned > 0
                                  ? `+${day.arenaPointsEarned}`
                                  : "0"}
                              </span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/50 text-center tracking-tighter">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
    </Card>
  );
}
