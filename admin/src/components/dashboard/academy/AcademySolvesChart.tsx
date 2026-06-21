"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Solves",
    color: "var(--chart-3)", // Orange color for solves leaderboard
  },
} satisfies ChartConfig;

interface SolvesData {
  trackSlug: string;
  count: number;
}

interface AcademySolvesChartProps {
  data: SolvesData[];
}

export function AcademySolvesChart({ data }: AcademySolvesChartProps) {
  // Map all data without sorting or slicing
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].map((item) => ({
      ...item,
      trackSlug: String(item.trackSlug).toUpperCase(),
    }));
  }, [data]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Most Solves</CardTitle>
        <CardDescription>All tracks across the academy</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ChartContainer
          config={chartConfig}
          className="h-[350px] w-full px-4 pt-2"
        >
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
          >
            <CartesianGrid />
            <XAxis
              dataKey="trackSlug"
              axisLine={false}
              tickLine={false}
              fontSize={10}
              tickMargin={10}
              tickFormatter={(value) => (value.length > 5 ? value.slice(0, 5) + "..." : value)}
              // Let Recharts auto-skip labels so they don't overlap when there are 82 bars
            />
            <YAxis
              type="number"
              hide // Hide the vertical axis numbers for a cleaner look
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">
                        Track: {String(data.trackSlug).toUpperCase()}
                      </div>
                      <div className="flex w-full items-center gap-2 mt-0.5">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--color-count)" }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center gap-4">
                          <span className="text-muted-foreground">
                            Solves
                          </span>
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
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50} // Prevent bars from getting too fat on ultrawide monitors
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
