"use client";

import * as React from "react";
import { Pie, PieChart, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Base config so Shadcn ChartContainer passes context properly
const chartConfig = {
  count: {
    label: "Exercises",
  },
} satisfies ChartConfig;

interface DifficultyData {
  difficulty: number | null;
  count: number;
}

interface AcademyDifficultyChartProps {
  data: DifficultyData[];
}

export function AcademyDifficultyChart({ data }: AcademyDifficultyChartProps) {
  // Sort data logically: 1 to 10, with null (Unrated) at the end
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => {
        if (a.difficulty === null) return 1;
        if (b.difficulty === null) return -1;
        return a.difficulty - b.difficulty;
      })
      .map((item) => ({
        ...item,
        name: item.difficulty === null ? "Unrated" : `Level ${item.difficulty}`,
        // Map directly to our custom theme colors
        fill: getDifficultyColor(item.difficulty),
      }));
  }, [data]);

  const totalExercises = React.useMemo(() => {
    return sortedData.reduce((acc, curr) => acc + curr.count, 0);
  }, [sortedData]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0">
        <CardTitle>Difficulty Distribution</CardTitle>
        <CardDescription>Global breakdown (Levels 1-10)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[300px] w-full"
        >
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">
                        {data.name}
                      </div>
                      <div className="flex w-full items-center gap-2 mt-0.5">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: data.fill }}
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
            <Pie
              data={sortedData}
              dataKey="count"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={5}
              stroke="var(--background)"
              labelLine={(props: any) => {
                const { cx, cy, midAngle, outerRadius, stroke, index } = props;
                const RADIAN = Math.PI / 180;
                const sin = Math.sin(-RADIAN * midAngle);
                const cos = Math.cos(-RADIAN * midAngle);
                
                const length1 = 20;
                const length2 = 30;
                
                // On the right side, Recharts draws counter-clockwise (from bottom to top).
                // This means higher indices are physically HIGHER up the screen (smaller y).
                // To prevent the lines from crossing, we must push the higher indices further UP (negative y).
                let yOffset = 0;
                if (index > 6) {
                  yOffset = (index - 6) * -14; 
                }
                
                const sx = cx + outerRadius * cos;
                const sy = cy + outerRadius * sin;
                const mx = cx + (outerRadius + length1) * cos;
                const my = cy + (outerRadius + length1) * sin + yOffset;
                const ex = mx + (cos >= 0 ? 1 : -1) * length2;
                const ey = my;

                return <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={stroke} fill="none" opacity={0.6} />;
              }}
              label={(props: any) => {
                const { cx, cy, midAngle, outerRadius, name, fill, index } = props;
                const RADIAN = Math.PI / 180;
                const sin = Math.sin(-RADIAN * midAngle);
                const cos = Math.cos(-RADIAN * midAngle);

                const length1 = 20;
                const length2 = 30;
                
                let yOffset = 0;
                if (index > 6) {
                  yOffset = (index - 6) * -14;
                }
                
                const mx = cx + (outerRadius + length1) * cos;
                const my = cy + (outerRadius + length1) * sin + yOffset;
                const ex = mx + (cos >= 0 ? 1 : -1) * length2;
                const ey = my;
                
                const textAnchor = cos >= 0 ? "start" : "end";
                const padding = cos >= 0 ? 4 : -4;

                return (
                  <text
                    x={ex + padding}
                    y={ey}
                    fill={fill}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    className="text-[11px] font-semibold tracking-wide"
                  >
                    {name}
                  </text>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalExercises.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Most exercises are Level 2 and 3
        </div>
        <div className="leading-none text-muted-foreground text-center">
          Showing difficulty spread across all tracks
        </div>
      </CardFooter>
    </Card>
  );
}

function getDifficultyColor(diff: number | null) {
  if (diff === null) return "var(--muted)";
  if (diff <= 2) return "var(--chart-5)"; // Green (Easy)
  if (diff <= 4) return "var(--chart-2)"; // Cyan (Medium-Easy)
  if (diff <= 6) return "var(--chart-1)"; // Yellow (Medium)
  if (diff <= 8) return "var(--chart-3)"; // Orange (Hard)
  return "var(--chart-4)"; // Blue (Very Hard)
}
