"use client";

import * as React from "react";
import { Cell, Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { type CompanyStats } from "@/services/company.service";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

export function CompanyDifficultyChart({ stats }: { stats?: CompanyStats }) {
  const { totalData, solvedData, hasData, totalAvailable, totalSolved } = React.useMemo(() => {
    if (!stats) return { totalData: [], solvedData: [], hasData: false, totalAvailable: 0, totalSolved: 0 };

    const { totalDifficultyBreakdown, solvedDifficultyBreakdown } = stats;

    const tData = [
      { name: "Easy", count: totalDifficultyBreakdown.easy, fill: "var(--chart-5)" },
      { name: "Medium", count: totalDifficultyBreakdown.medium, fill: "var(--chart-1)" },
      { name: "Hard", count: totalDifficultyBreakdown.hard, fill: "var(--chart-3)" },
    ].filter(d => d.count > 0);

    const sData = [
      { name: "Easy", count: solvedDifficultyBreakdown.easy, fill: "var(--chart-5)" },
      { name: "Medium", count: solvedDifficultyBreakdown.medium, fill: "var(--chart-1)" },
      { name: "Hard", count: solvedDifficultyBreakdown.hard, fill: "var(--chart-3)" },
    ].filter(d => d.count > 0);

    const tAvailable = tData.reduce((acc, curr) => acc + curr.count, 0);
    const tSolved = sData.reduce((acc, curr) => acc + curr.count, 0);

    return { 
      totalData: tData, 
      solvedData: sData, 
      hasData: tData.length > 0 || sData.length > 0,
      totalAvailable: tAvailable,
      totalSolved: tSolved
    };
  }, [stats]);

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">{data.name}</div>
          <div className="flex w-full items-center gap-2 mt-0.5">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: data.fill }}
            />
            <div className="flex flex-1 justify-between leading-none items-center gap-4">
              <span className="text-muted-foreground">Count</span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {data.count}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle>Difficulty Breakdown</CardTitle>
        <CardDescription>Available Questions vs Successful Solves</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col justify-center">
        {!hasData ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">
            No difficulty data available
          </div>
        ) : (
          <div className="grid grid-cols-2 h-[300px] w-full px-2 pt-6">
            {/* Total Questions Donut */}
            <div className="flex flex-col items-center justify-center">
              <ChartContainer config={chartConfig} className="h-full w-full mx-auto">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <ChartTooltip cursor={false} content={renderTooltip} />
                  <Pie
                    data={totalData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    strokeWidth={5}
                    stroke="var(--background)"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                {totalAvailable.toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
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
            </div>

            {/* Solved Questions Donut */}
            <div className="flex flex-col items-center justify-center">
              <ChartContainer config={chartConfig} className="h-full w-full mx-auto">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <ChartTooltip cursor={false} content={renderTooltip} />
                  <Pie
                    data={solvedData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    strokeWidth={5}
                    stroke="var(--background)"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                {totalSolved.toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                Solved
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            
            {/* Custom Legend to match Arena styling (No extra imports needed) */}
            <div className="col-span-2 flex justify-center gap-6 mt-2">
              {[{name: "Easy", color: "var(--chart-5)"}, {name: "Medium", color: "var(--chart-1)"}, {name: "Hard", color: "var(--chart-3)"}].map(l => (
                <div key={l.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: `hsl(${l.color})` }} />
                  <span className="text-xs text-muted-foreground font-medium">{l.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
