"use client";

import * as React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const chartConfig = {
  easy: { label: "Easy", color: "#10b981" },
  medium: { label: "Medium", color: "#eab308" },
  hard: { label: "Hard", color: "#ef4444" },
  solves: { label: "Solves", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

interface RoadmapTrafficChartProps {
  data: {
    name: string;
    slug: string;
    count: number;
    difficulty: { easy: number; medium: number; hard: number };
  }[];
}

export function RoadmapTrafficChart({ data }: RoadmapTrafficChartProps) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: item.name,
      easy: item.difficulty.easy,
      medium: item.difficulty.medium,
      hard: item.difficulty.hard,
      solves: item.count,
    }));
  }, [data]);

  const totals = React.useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        acc.easy += curr.easy;
        acc.medium += curr.medium;
        acc.hard += curr.hard;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );
  }, [chartData]);

  return (
    <Card className="flex flex-col h-full overflow-hidden col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1.5">
          <CardTitle>Content vs Traffic Overview</CardTitle>
          <CardDescription>
            Stacked bars show Roadmap difficulty distribution. The glowing line tracks Global User Solves.
          </CardDescription>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Easy</span>
            <span className="text-lg font-bold tabular-nums text-[#10b981] leading-none mt-1">{totals.easy}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Medium</span>
            <span className="text-lg font-bold tabular-nums text-[#eab308] leading-none mt-1">{totals.medium}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Hard</span>
            <span className="text-lg font-bold tabular-nums text-[#ef4444] leading-none mt-1">{totals.hard}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="w-full">
          <div className="w-full min-w-[1000px] px-4 pt-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid  />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tickMargin={10} 
                  tickFormatter={(value) => String(value).length > 10 ? String(value).slice(0, 8) + '...' : String(value)}
                />
                
                {/* Left Axis for Problem Counts (Stacked Bars) */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                />
                
                {/* Right Axis for User Solves (Line Graph) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                />
                
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="grid min-w-[10rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-3 py-2 text-xs shadow-xl">
                          <div className="font-medium mb-1 text-sm border-b pb-1.5">{data.name}</div>
                          
                          <div className="flex w-full items-center gap-2 mt-1">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "#10b981" }} />
                            <div className="flex flex-1 justify-between leading-none items-center gap-4">
                              <span className="text-muted-foreground">Easy</span>
                              <span className="font-mono font-medium tabular-nums text-foreground">{data.easy}</span>
                            </div>
                          </div>
                          
                          <div className="flex w-full items-center gap-2">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "#eab308" }} />
                            <div className="flex flex-1 justify-between leading-none items-center gap-4">
                              <span className="text-muted-foreground">Medium</span>
                              <span className="font-mono font-medium tabular-nums text-foreground">{data.medium}</span>
                            </div>
                          </div>
                          
                          <div className="flex w-full items-center gap-2">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: "#ef4444" }} />
                            <div className="flex flex-1 justify-between leading-none items-center gap-4">
                              <span className="text-muted-foreground">Hard</span>
                              <span className="font-mono font-medium tabular-nums text-foreground">{data.hard}</span>
                            </div>
                          </div>
                          
                          <div className="mt-1 pt-2 border-t flex w-full items-center gap-2">
                            <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-primary" />
                            <div className="flex flex-1 justify-between leading-none items-center gap-4">
                              <span className="text-muted-foreground">Solves</span>
                              <span className="font-mono font-medium tabular-nums text-foreground">{data.solves}</span>
                            </div>
                          </div>
                          
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />

                {/* Content Supply (Stacked Bars mapped to Left Axis) */}
                <Bar yAxisId="left" dataKey="easy" stackId="a" fill="var(--color-easy)" radius={[0, 0, 4, 4]} maxBarSize={40} />
                <Bar yAxisId="left" dataKey="medium" stackId="a" fill="var(--color-medium)" maxBarSize={40} />
                <Bar yAxisId="left" dataKey="hard" stackId="a" fill="var(--color-hard)" radius={[4, 4, 0, 0]} maxBarSize={40} />

                {/* Traffic Demand (Line mapped to Right Axis) */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="solves" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  strokeWidth={3} 
                  dot={false}
                  activeDot={false} 
                />
              </ComposedChart>
            </ChartContainer>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
