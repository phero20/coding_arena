"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Concepts",
    color: "var(--chart-3)", // Used var() directly because your globals.css uses rgb()
  },
} satisfies ChartConfig;

interface AcademyConceptsChartProps {
  data: { trackSlug: string; count: number }[];
}

export function AcademyConceptsChart({ data }: AcademyConceptsChartProps) {
  // We DO NOT sort the data so the chart looks jagged and "cool".
  // We only include tracks that actually have concepts.
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.filter((item) => item.count > 0);
  }, [data]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Track Concept Density</CardTitle>
        <CardDescription>
          Showing the distribution of concepts across active language tracks.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full" type="always">
          <div className="w-full min-w-[1000px] lg:min-w-[1200px] px-2 pb-4 pt-2">
            <ChartContainer  config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid  />
                
                {/* Y-axis for scale */}
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />

                {/* X-axis showing truncated labels */}
                <XAxis
                  dataKey="trackSlug"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={10}
                  tickFormatter={(value) => String(value).slice(0, 3).toUpperCase()}
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
                                Concepts
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
                
                <Area
                  type="monotone"
                  dataKey="count"
                  fill="url(#fillCount)"
                  fillOpacity={1}
                  stroke="var(--color-count)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
          <ScrollBar orientation="horizontal" className="text-primary" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
