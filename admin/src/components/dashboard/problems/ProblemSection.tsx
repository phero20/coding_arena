"use client";

import { useProblemStats } from "@/hooks/useProblems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProblemDifficultyChart } from "./ProblemDifficultyChart";
import { ProblemLanguagesChart } from "./ProblemLanguagesChart";
import { ProblemUserSolvesRadarChart } from "./ProblemUserSolvesRadarChart";
import { ProblemSubmissionStatusRadarChart } from "./ProblemSubmissionStatusRadarChart";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

export function ProblemSection() {
  const { stats, isLoading, isError, error } = useProblemStats();

  const statItems = [
    { title: "Problems", value: stats?.problems || 0, href: "/problems" },
    {
      title: "Test Cases",
      value: stats?.testcases || 0,
      href: "/problems",
    },
  ];

  return (
    <div className="space-y-4 py-28 border-b">
      <DashboardSectionHeader title="Problems Overview" description="Metrics for all coding problems and tests" />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading problem metrics..."
      >
        {!stats ? (
          <EmptyState message="No problem metrics available." />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
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
              <div className="md:col-span-2 min-w-0">
                <ProblemLanguagesChart languages={stats.userSolvedLanguages} />
              </div>
            </div>

            <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="min-w-0">
                <ProblemDifficultyChart difficulty={stats.difficulty} />
              </div>
              <div className="min-w-0">
                <ProblemUserSolvesRadarChart
                  userSolvedProblems={stats.userSolvedProblems}
                />
              </div>
              <div className="min-w-0">
                <ProblemSubmissionStatusRadarChart
                  submissionStatus={stats.submissionStatus}
                  totalSubmissions={stats.totalSubmissions}
                />
              </div>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
