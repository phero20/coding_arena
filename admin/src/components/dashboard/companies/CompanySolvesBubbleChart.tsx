"use client";

import * as React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CompanyStats } from "@/services/company.service";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  solves: {
    label: "Solves",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function CompanySolvesBubbleChart({ data }: { data?: CompanyStats["topCompaniesBySolves"] }) {
  const scatterData = React.useMemo(() => {
    if (!data) return [];
    
    return data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
  }, [data]);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader>
        <CardTitle>Company Solve Density</CardTitle>
        <CardDescription>
          Scatter plot of all companies. The higher the dot, the more solves it contains.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {scatterData.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">
            No solve data available
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[350px] w-full px-2 pb-4 pt-2"
          >
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid />

              <XAxis
                type="number"
                dataKey="index"
                domain={[0, scatterData.length + 1]}
                hide
              />

              {/* YAxis sets the height based on solve count */}
              <YAxis
                type="number"
                dataKey="totalSolves"
                name="Solves"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
              />

              {/* Custom tooltip to show the specific Company name and solves */}
              <ChartTooltip
                cursor={{
                  strokeDasharray: "3 3",
                  stroke: "var(--color-solves)",
                  opacity: 0.2,
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="font-medium">
                          Company: {String(data.name).toUpperCase()}
                        </div>
                        <div className="flex w-full items-center gap-2 mt-0.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: "var(--color-solves)" }}
                          />
                          <div className="flex flex-1 justify-between leading-none items-center gap-4">
                            <span className="text-muted-foreground">
                              Solves
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {data.totalSolves}
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
                name="Solves"
                dataKey="totalSolves"
                data={scatterData}
                fill="var(--color-solves)"
              />
            </ScatterChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
