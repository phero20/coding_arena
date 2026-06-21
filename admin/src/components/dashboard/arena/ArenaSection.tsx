"use client";

import { useArenaStats } from "@/hooks/useArena";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ArenaLanguagesBarChart } from "./ArenaLanguagesBarChart";
import { ArenaProblemsAreaChart } from "./ArenaProblemsAreaChart";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ArenaSection() {
  const { stats, isLoading, isError, error } = useArenaStats();

  const statItems = [
    {
      title: "Total Matches",
      value: stats?.totalMatches || 0,
      href: "/arena",
    },
    {
      title: "Total Submissions",
      value: stats?.totalSubmissions || 0,
      href: "/arena",
    },
  ];

  return (
    <div className="space-y-4 py-28 border-b">
      <DashboardSectionHeader 
        title="Arena Overview" 
        description="Real-time statistics for all multiplayer coding battles" 
      />

      <QueryState 
        isLoading={isLoading} 
        isError={isError} 
        error={error} 
        loadingMessage="Loading arena stats..."
      >
        {!stats ? (
          <EmptyState message="No arena metrics available." />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Stat Cards Stacked */}
            <div className="flex flex-col gap-6">
              {statItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="bg-card hover:bg-card/80 transition-colors flex flex-col flex-1"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between flex-1 mt-4">
                    <div className="text-4xl font-bold">{item.value.toLocaleString()}</div>
                    <Link href={item.href}>
                      <Button variant="outline" size="sm">
                        View <ArrowRight className="size-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Column: Languages Chart */}
            <div className="md:col-span-2 min-w-0">
              <ArenaLanguagesBarChart languages={stats.languages} />
            </div>
          </div>

          {/* Bottom Row: Full Width Problems Area Chart */}
          <div className="mt-6">
            <div className="min-w-0">
              <ArenaProblemsAreaChart problems={stats.problems} />
            </div>
          </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
