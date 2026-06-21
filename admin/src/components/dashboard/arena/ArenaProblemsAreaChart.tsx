"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  count: {
    label: "Plays",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface ArenaProblemsAreaChartProps {
  problems: Record<string, number>;
}

export function ArenaProblemsAreaChart({ problems }: ArenaProblemsAreaChartProps) {
  const chartData = React.useMemo(() => {
    return Object.entries(problems || {})
      .map(([id, count]) => ({
        id: id.substring(0, 8), // short ID for axis
        fullId: id,
        count,
      }))
  }, [problems]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Top Problems</CardTitle>
        <CardDescription>Most frequently played problems</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">
            No problem data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full px-4 pt-2">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid />
              <XAxis 
                dataKey="id" 
                axisLine={false}
                tickLine={false}
                fontSize={10}
                tickMargin={10}
              />
              <YAxis
                type="number"
                hide
              />
              <ChartTooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.3 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="font-medium text-[10px] text-muted-foreground break-all">
                          ID: {data.fullId}
                        </div>
                        <div className="flex w-full items-center gap-2 mt-0.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: "var(--color-count)" }}
                          />
                          <div className="flex flex-1 justify-between leading-none items-center gap-4">
                            <span className="text-muted-foreground">Plays</span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {data.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="var(--color-count)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
