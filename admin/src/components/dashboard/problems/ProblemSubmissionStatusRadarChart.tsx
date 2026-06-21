"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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
    label: "Submissions",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

interface ProblemSubmissionStatusRadarChartProps {
  submissionStatus: Record<string, number>;
  totalSubmissions: number;
}

export function ProblemSubmissionStatusRadarChart({ submissionStatus, totalSubmissions }: ProblemSubmissionStatusRadarChartProps) {
  const chartData = React.useMemo(() => {
    if (!submissionStatus) return [];
    
    // Normalize status names for display
    const formatStatus = (status: string) => {
      return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    };

    return Object.entries(submissionStatus)
      .map(([status, count]) => ({
        status: formatStatus(status),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [submissionStatus]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0 flex flex-row items-start justify-between">
        <div>
          <CardTitle>Submission Status</CardTitle>
          <CardDescription>Breakdown of all code execution outcomes</CardDescription>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{totalSubmissions.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0 mt-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[280px] w-full"
        >
          <RadarChart
            data={chartData}
            margin={{ top: 15, right: 25, bottom: 15, left: 25 }}
          >
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover text-popover-foreground px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">
                        Status: {data.status}
                      </div>
                      <div className="flex w-full items-center gap-2 mt-0.5">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--color-count)" }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center gap-4">
                          <span className="text-muted-foreground">
                            Submissions
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
            <PolarGrid gridType="circle" />
            <PolarAngleAxis 
              dataKey="status" 
              tick={(props: any) => {
                const { payload, x, y, cx, cy, textAnchor } = props;
                const value = payload.value;
                const count = chartData.find(d => d.status === value)?.count || 0;
                
                // Truncate long status names
                const displayValue = value.length > 10 ? value.substring(0, 10) + "..." : value;
                
                // Push labels further out from the circle
                const radiusOffset = 12; 
                const angle = Math.atan2(y - cy, x - cx);
                const newX = x + Math.cos(angle) * radiusOffset;
                const newY = y + Math.sin(angle) * radiusOffset;
                
                return (
                  <text x={newX} y={newY} textAnchor={textAnchor} className="text-[11px] tracking-wide">
                    <tspan x={newX} dy="0em" className="font-semibold fill-foreground">{displayValue}</tspan>
                    <tspan x={newX} dy="1.2em" className="fill-muted-foreground">{count.toLocaleString()}</tspan>
                  </text>
                );
              }}
            />
            <Radar
              dataKey="count"
              fill="var(--color-count)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
