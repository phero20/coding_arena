"use client";

import * as React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from "recharts";
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
    label: "Exercises",
    color: "var(--chart-2)", // Cyan color for exercises
  },
} satisfies ChartConfig;

interface AcademyExercisesChartProps {
  data: { trackSlug: string; count: number }[];
}

export function AcademyExercisesChart({ data }: AcademyExercisesChartProps) {
  // Map data to include an invisible X-axis index to spread the dots perfectly
  const scatterData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
  }, [data]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Track Exercise Density</CardTitle>
        <CardDescription>
          Scatter plot of all tracks. The higher the dot, the more exercises it
          contains.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full px-2 pb-4 pt-2"
        >
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid />

            <XAxis
              type="number"
              dataKey="index"
              domain={[0, scatterData.length + 1]}
              hide
            />

            {/* YAxis sets the height based on exercise count */}
            <YAxis
              type="number"
              dataKey="count"
              name="Exercises"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />

            {/* Custom tooltip to show the specific Track name and count */}
            <ChartTooltip
              cursor={{
                strokeDasharray: "3 3",
                stroke: "var(--color-count)",
                opacity: 0.2,
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
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
                            Exercises
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

            <Scatter
              name="Exercises"
              dataKey="count"
              data={scatterData}
              fill="var(--color-count)"
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
