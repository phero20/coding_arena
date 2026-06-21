"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const chartConfig = {
  solves: {
    label: "Solves",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface ProblemUserSolvesRadarChartProps {
  userSolvedProblems: { easy: number; medium: number; hard: number; total: number };
}

export function ProblemUserSolvesRadarChart({ userSolvedProblems }: ProblemUserSolvesRadarChartProps) {
  const chartData = React.useMemo(() => {
    return [
      { difficulty: "Easy", solves: userSolvedProblems?.easy || 0 },
      { difficulty: "Medium", solves: userSolvedProblems?.medium || 0 },
      { difficulty: "Hard", solves: userSolvedProblems?.hard || 0 },
    ];
  }, [userSolvedProblems]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0">
        <CardTitle>User Solves by Difficulty</CardTitle>
        <CardDescription>Breakdown of all successful user submissions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 mt-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[280px] w-full"
        >
          <RadarChart
            data={chartData}
            margin={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">
                        Difficulty: {data.difficulty}
                      </div>
                      <div className="flex w-full items-center gap-2 mt-0.5">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--color-solves)" }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center gap-4">
                          <span className="text-muted-foreground">
                            Solves
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {data.solves}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <PolarGrid gridType="circle" />
            <PolarAngleAxis 
              dataKey="difficulty" 
              tick={(props: any) => {
                const { payload, x, y, cx, cy, textAnchor } = props;
                const value = payload.value;
                const count = chartData.find(d => d.difficulty === value)?.solves || 0;
                
                // Push labels further out from the circle
                const radiusOffset = 12; 
                const angle = Math.atan2(y - cy, x - cx);
                const newX = x + Math.cos(angle) * radiusOffset;
                const newY = y + Math.sin(angle) * radiusOffset;

                return (
                  <text x={newX} y={newY} textAnchor={textAnchor} className="text-[11px] tracking-wide">
                    <tspan x={newX} dy="0em" className="font-semibold fill-foreground">{value}</tspan>
                    <tspan x={newX} dy="1.2em" className="fill-muted-foreground">{count.toLocaleString()}</tspan>
                  </text>
                );
              }}
            />
            <Radar
              dataKey="solves"
              fill="var(--color-solves)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
