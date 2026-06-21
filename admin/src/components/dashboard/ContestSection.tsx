"use client";

import { useContestStats } from "@/hooks/useContest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { DashboardSectionHeader } from "./shared/DashboardSectionHeader";

export function ContestSection() {
  const { stats, isLoading, isError, error } = useContestStats();

  const statItems = [
    { title: "Total Contests", value: stats?.contests || 0, href: "/contests", icon: Trophy },
  ];

  return (
   <div className="space-y-4 py-28 border-b">
      <DashboardSectionHeader title="Contests Overview" description="Metrics for external competitive programming contests" />

      <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading contest metrics...">
        {!stats ? (
          <EmptyState message="No contest metrics available." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, idx) => (
              <Card key={idx} className="bg-card hover:bg-card/80 transition-colors flex flex-col h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-end justify-between flex-1">
                  <div className="text-2xl font-bold">{item.value}</div>
                  <Link href={item.href}>
                    <Button variant="outline" size="sm">
                      View <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
