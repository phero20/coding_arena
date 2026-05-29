"use client";

import React, { useMemo } from "react";
import { type LeetCodeStats } from "@/types/stats";
import { cn } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { Card } from "../ui/card";
import { 
  Line, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format } from "date-fns";

interface LeetCodeContestCardProps {
  stats: LeetCodeStats;
  username: string;
  className?: string;
}

const chartConfig = {
  rating: {
    label: "Rating",
    color: "#FFA116", // LeetCode Orange
  },
} satisfies ChartConfig;

export function LeetCodeContestCard({ stats, username, className }: LeetCodeContestCardProps) {
  if (!stats.contest) return null;

  const { rating, globalRank, totalParticipants, attended, history } = stats.contest;

  // Format data for Recharts
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // We show the last 10-12 contests for a clean look
    return history.slice(-12).map((h) => ({
      date: format(new Date(h.date), "MMM d, yy"),
      rating: h.rating,
    }));
  }, [history]);

  return (
    <a 
      href={`https://leetcode.com/${username}/contest`}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline"
    >
      <Card
        className={cn(
          "relative flex flex-col p-4 cursor-pointer hover:bg-muted/40 transition-all active:scale-[0.99] group/card overflow-hidden",
          className
        )}
      >
        {/* Top Left Branding */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground group-hover/card:text-difficulty-medium transition-colors">
          <Code2 size={12} className="text-difficulty-medium" />
          {username}
        </div>

        {/* 1. Metrics Header */}
        <div className="grid grid-cols-3 gap-2 mt-4 mb-6 shrink-0">
          <div className="">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-70">
              Rating
            </p>
            <p className="text-xl font-black tabular-nums tracking-tighter text-foreground">
              {Math.floor(rating).toLocaleString()}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-70">
              Ranking
            </p>
            <div className="flex items-baseline gap-0.5">
               <span className="text-sm font-bold tabular-nums">
                 {globalRank.toLocaleString()}
               </span>
               <span className="text-[8px] text-muted-foreground/40 font-medium">
                 /{totalParticipants > 0 ? (totalParticipants / 1000).toFixed(0) + "K" : "871K"}
               </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-70">
              Attended
            </p>
            <p className="text-sm font-bold tabular-nums">
              {attended}
            </p>
          </div>
        </div>

        {/* 2. Shadcn/Recharts Section */}
        <div className="w-full">
          <ChartContainer config={chartConfig} className="h-20 w-full">
            <LineChart
              data={chartData}
              margin={{
                left: 0,
                right: 0,
                top: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                hide
              />
              <YAxis
                hide
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="var(--color-rating)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>

        </div>
      </Card>
    </a>
  );
}
