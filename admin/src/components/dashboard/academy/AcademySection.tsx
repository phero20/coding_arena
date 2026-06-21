"use client";

import * as React from "react";
import { useAcademyStats } from "@/hooks/useAcademy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AcademyConceptsChart } from "./AcademyConceptsChart";
import { AcademyExercisesChart } from "./AcademyExercisesChart";
import { AcademyDifficultyChart } from "./AcademyDifficultyChart";
import { AcademySolvesChart } from "./AcademySolvesChart";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

export function AcademySection() {
  const { stats, isLoading, isError, error } = useAcademyStats();

  const statItems = [
    { title: "Tracks", value: stats?.tracks || 0, href: "/academy/tracks" },
    { title: "Configs", value: stats?.configs || 0, href: "/academy/configs" },
    {
      title: "Concepts",
      value: stats?.concepts || 0,
      href: "/academy/concepts",
    },
    {
      title: "Exercises",
      value: stats?.exercises || 0,
      href: "/academy/exercises",
    },
  ];

  return (
   <div className="space-y-4 pb-28 py-10 border-y">
      <DashboardSectionHeader title="Academy Overview" description="Metrics for all academy content tables" />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading academy metrics..."
      >
        {!stats ? (
          <EmptyState message="No academy metrics available." />
        ) : (
          <div className="space-y-6">
            {/* Top Stat Cards */}
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

            {/* Isolated modular Chart Components */}
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="min-w-0"><AcademyConceptsChart data={stats.conceptsPerTrack} /></div>
              <div className="min-w-0"><AcademyExercisesChart data={stats.exercisesPerTrack} /></div>
              <div className="min-w-0"><AcademyDifficultyChart data={stats.difficultyDistribution} /></div>
              <div className="min-w-0"><AcademySolvesChart data={stats.userSolvesPerTrack} /></div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
