"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CompanyStats } from "@/services/company.service";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  solves: {
    label: "Solves",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function CompanySolvesBarChart({ data }: { data?: CompanyStats["topCompaniesBySolves"] }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.slice(0, 10).map((item) => ({
      name: item.name,
      solves: item.totalSolves,
    }));
  }, [data]);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Most Solved Companies</CardTitle>
        <CardDescription>Top companies by user solves</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {chartData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">
            No solve data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full px-4 pt-2">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                fontSize={10} 
                tickMargin={10} 
                tickFormatter={(value) => (value.length > 8 ? value.slice(0, 8) + "..." : value)}
              />
              <YAxis type="number" hide />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="font-medium">Company: {data.name}</div>
                        <div className="flex w-full items-center gap-2 mt-0.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: "var(--color-solves)" }}
                          />
                          <div className="flex flex-1 justify-between leading-none items-center gap-4">
                            <span className="text-muted-foreground">Solves</span>
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
              <Bar 
                dataKey="solves" 
                fill="var(--color-solves)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50} 
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
