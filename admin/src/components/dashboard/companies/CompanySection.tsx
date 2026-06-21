"use client";

import { useCompanyStats } from "@/hooks/useCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight, Building2, HelpCircle } from "lucide-react";
import { CompanySolvesBubbleChart } from "./CompanySolvesBubbleChart";
import { CompanyTotalDifficultyChart } from "./CompanyTotalDifficultyChart";
import { CompanySolvedDifficultyChart } from "./CompanySolvedDifficultyChart";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

export function CompanySection() {
  const { stats, isLoading, isError, error } = useCompanyStats();

  const statItems = [
    {
      title: "Companies",
      value: stats?.companies || 0,
      href: "/companies",
      icon: Building2,
    },
    {
      title: "Total Linked Questions",
      value: stats?.totalQuestions || 0,
      href: "/companies",
      icon: HelpCircle,
    },
  ];

  return (
    <div className="space-y-4 py-28 border-b">
      <DashboardSectionHeader title="Companies Overview" description="Metrics for companies and associated problems" />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading company metrics..."
      >
        {!stats ? (
          <EmptyState message="No company metrics available." />
        ) : (
          <div className="space-y-4">
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
              <div className="min-w-0">
                <CompanyTotalDifficultyChart stats={stats} />
              </div>
              <div className="min-w-0">
                <CompanySolvedDifficultyChart stats={stats} />
              </div>
            </div>

            <div className="grid gap-6 mt-6">
              <div className="min-w-0">
                <CompanySolvesBubbleChart data={stats.topCompaniesBySolves} />
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
