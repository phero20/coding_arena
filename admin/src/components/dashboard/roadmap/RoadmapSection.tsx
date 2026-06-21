"use client";

import { useTaxonomyStats } from "@/hooks/useTaxonomy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RoadmapTrafficChart } from "./RoadmapTrafficChart";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

export function RoadmapSection() {
  const { stats, isLoading, isError, error } = useTaxonomyStats();

  const statItems = [
    { title: "Categories", value: stats?.categories || 0, href: "/roadmap" },
    {
      title: "Mapped Problems",
      value: stats?.traffic?.reduce(
        (acc, curr) => acc + curr.difficulty.easy + curr.difficulty.medium + curr.difficulty.hard,
        0
      ) || 0,
      href: "/roadmap",
    },
  ];

  return (
    <div className="space-y-4 py-28 border-b">
      <DashboardSectionHeader title="Roadmap Overview" description="Metrics for taxonomy and problem mappings" />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading roadmap metrics..."
      >
        {!stats ? (
          <EmptyState message="No roadmap metrics available." />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="bg-card hover:bg-card/80 transition-colors flex flex-col h-full"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between flex-1">
                    <div className="text-2xl font-bold">{item.value}</div>
                    <Link href={item.href}>
                      <Button variant="outline" size="sm">
                        View <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 mt-6">
              <div className="min-w-0">
                <RoadmapTrafficChart data={stats.traffic || []} />
              </div>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
