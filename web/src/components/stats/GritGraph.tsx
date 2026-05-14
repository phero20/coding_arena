"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  format, 
  subDays, 
  eachMonthOfInterval, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getYear, 
  startOfYear, 
  endOfYear, 
  isSameYear,
  isAfter,
  isBefore,
  parseISO
} from "date-fns";
import { type UserActivityLog, type UserStats } from "@/types/stats";
import { Info, Target, Sword, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GritGraphProps {
  activityLog: UserActivityLog[];
  stats: UserStats;
  joinedAt: string;
  className?: string;
}

export function GritGraph({ activityLog, stats, joinedAt, className }: GritGraphProps) {
  const [selectedYear, setSelectedYear] = useState<string>("Current");
  const [hoveredDay, setHoveredDay] = useState<UserActivityLog | null>(null);

  const today = new Date();
  const joinDate = parseISO(joinedAt);
  const currentYearNum = getYear(today);
  const joinedYearNum = getYear(joinDate);

  // 1. Generate Year Options Dynamically
  const yearOptions = useMemo(() => {
    const years = ["Current"];
    for (let year = currentYearNum; year >= joinedYearNum; year--) {
      years.push(year.toString());
    }
    return years;
  }, [currentYearNum, joinedYearNum]);

  // 2. Determine Temporal Bounds
  const { dateRangeStart, dateRangeEnd } = useMemo(() => {
    if (selectedYear === "Current") {
      return {
        dateRangeStart: subDays(today, 364),
        dateRangeEnd: today
      };
    }
    
    const year = parseInt(selectedYear);
    const mStart = startOfYear(new Date(year, 0, 1));
    const mEnd = isSameYear(new Date(year, 0, 1), today) ? today : endOfYear(new Date(year, 0, 1));
    
    return {
      dateRangeStart: mStart,
      dateRangeEnd: mEnd
    };
  }, [selectedYear, today]);

  // 3. Filter and Calculate Telemetry for Selected Window
  const { totalSubmissions, activeDays, filteredMonthsData } = useMemo(() => {
    let totalSubs = 0;
    let actDays = 0;

    const months = eachMonthOfInterval({ start: dateRangeStart, end: dateRangeEnd });
    
    const processedMonths = months.map(month => {
      // Find overlap between the month and our range
      const mStart = startOfMonth(month) < dateRangeStart ? dateRangeStart : startOfMonth(month);
      const mEnd = endOfMonth(month) > dateRangeEnd ? dateRangeEnd : endOfMonth(month);
      
      const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });
      
      return {
        label: format(month, "MMM"),
        days: daysInMonth.map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          const activity = activityLog.find(a => a.date === dateStr);
          
          if (activity) {
            totalSubs += (activity.submissions || 0);
            if (activity.submissions > 0) actDays += 1;
          }

          return {
            date,
            submissions: activity?.submissions || 0,
            matches: activity?.matches || 0,
            pointsEarned: activity?.pointsEarned || 0,
            arenaPointsEarned: activity?.arenaPointsEarned || 0,
          };
        }),
      };
    });

    return { 
      totalSubmissions: totalSubs, 
      activeDays: actDays, 
      filteredMonthsData: processedMonths 
    };
  }, [activityLog, dateRangeStart, dateRangeEnd]);

  // 4. Level Logic
  const getLevel = (submissions: number) => {
    if (submissions === 0) return 0;
    if (submissions < 2) return 1;
    if (submissions < 4) return 2;
    if (submissions < 7) return 3;
    return 4;
  };

  const levelColors = [
    "bg-muted/90 ", 
    "bg-difficulty-easy/30",               
    "bg-difficulty-easy/60",               
    "bg-difficulty-easy/80",               
    "bg-difficulty-easy",                  
  ];

  return (
    <Card className={cn("px-4 py-5 space-y-5 bg-card border-border", className)}>
      <TooltipProvider delayDuration={0}>
        {/* Tactical Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-1">
              <span className="bg-muted px-2 py-0.5 rounded border border-border text-foreground font-bold">
                {totalSubmissions.toLocaleString()}
              </span>
              <span className="text-muted-foreground font-normal ml-1 whitespace-nowrap">
                submissions in {selectedYear === "Current" ? "the past one year" : selectedYear}
              </span>
            </h2>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14}  />
              </TooltipTrigger>
              <TooltipContent side="top" >
                Submissions are recorded in the UTC timezone.
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 leading-none">Total active days:</span>
              <span className="text-xs font-bold text-foreground">{activeDays}</span>
            </div>
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <span className="text-[10px] text-muted-foreground/60 leading-none">Current streak:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-foreground">{stats.currentStreak}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 leading-none">Max streak:</span>
              <span className="text-xs font-bold text-foreground">
                {selectedYear === "Current" ? stats.bestStreak : "—"}
              </span>
            </div>
            
            {/* Year Navigator Select */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-7 w-[100px] text-[10px] bg-muted border-border hover:bg-muted/80 transition-all font-medium">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year} className="text-[10px] focus:bg-muted focus:text-foreground">
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
                <div className="grid grid-rows-7 grid-flow-col gap-[1.5px]">
                  {month.days.map((day, dIdx) => {
                    const level = getLevel(day.submissions);
                    return (
                      <Tooltip key={dIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[11px] h-[11px] rounded-[2px] transition-all duration-200 cursor-pointer hover:ring-1 hover:ring-foreground/20 border border-border/20",
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
