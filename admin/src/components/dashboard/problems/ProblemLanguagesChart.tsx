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
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Solves",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface ProblemLanguagesChartProps {
  languages: Record<string, number>;
}

export function ProblemLanguagesChart({ languages }: ProblemLanguagesChartProps) {
  const chartData = React.useMemo(() => {
    if (!languages) return [];
    return Object.entries(languages)
      .map(([lang, count]) => ({
        langSlug: String(lang).toUpperCase(),
        count,
      }));
  }, [languages]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Languages Used</CardTitle>
        <CardDescription>Most popular languages used for solves</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ChartContainer
          config={chartConfig}
          className="h-[350px] w-full px-4 pt-2"
        >
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
          >
            <CartesianGrid />
            <XAxis
              dataKey="langSlug"
              axisLine={false}
              tickLine={false}
              fontSize={10}
              tickMargin={10}
              tickFormatter={(value) => (value.length > 5 ? value.slice(0, 5) + "..." : value)}
            />
            <YAxis
              type="number"
              hide
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">
                        Language: {data.langSlug}
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
              maxBarSize={50}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
