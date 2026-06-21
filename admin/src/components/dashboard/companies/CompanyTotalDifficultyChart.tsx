"use client";

import * as React from "react";
import { Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { type CompanyStats } from "@/services/company.service";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Questions",
  },
} satisfies ChartConfig;

export function CompanyTotalDifficultyChart({ stats }: { stats?: CompanyStats }) {
  const chartData = React.useMemo(() => {
    if (!stats) return [];
    const { totalDifficultyBreakdown } = stats;
    return [
      { name: "Easy", count: totalDifficultyBreakdown.easy, fill: "var(--chart-5)" },
      { name: "Medium", count: totalDifficultyBreakdown.medium, fill: "var(--chart-1)" },
      { name: "Hard", count: totalDifficultyBreakdown.hard, fill: "var(--chart-3)" },
    ].filter(item => item.count > 0);
  }, [stats]);

  const totalQuestions = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0">
        <CardTitle>Total Questions</CardTitle>
        <CardDescription>All linked questions across companies</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto h-[300px] w-full">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">{data.name}</div>
                      <div className="flex w-full items-center gap-2 mt-0.5">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: data.fill }} />
                        <div className="flex flex-1 justify-between leading-none items-center gap-4">
                          <span className="text-muted-foreground">Questions</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">{data.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
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
                
                let yOffset = 0;
                if (index > 1) {
                  yOffset = (index - 1) * -14; 
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
                if (index > 1) {
                  yOffset = (index - 1) * -14;
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
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    className="text-[11px] tracking-wide"
                  >
                    <tspan x={ex + padding} dy="-0.5em" fill={fill} className="font-semibold">
                      {name}
                    </tspan>
                    <tspan x={ex + padding} dy="1.2em" fill="var(--muted-foreground)">
                      {props.value}
                    </tspan>
                  </text>
                );
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalQuestions.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                          Available
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
        <div className="leading-none text-muted-foreground text-center">
          Showing difficulty spread of available questions
        </div>
      </CardFooter>
    </Card>
  );
}
