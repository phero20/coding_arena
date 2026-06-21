"use client";

import { useSystemDesignStats } from "@/hooks/useSystemDesign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight, Box, MonitorDot, Server } from "lucide-react";
import { DashboardSectionHeader } from "./shared/DashboardSectionHeader";

export function SystemDesignSection() {
  const { stats, isLoading, isError, error } = useSystemDesignStats();

  const statItems = [
    { title: "Topics", value: stats?.topics || 0, href: "/systemdesign", icon: Box },
    { title: "Workspaces", value: stats?.workspaces || 0, href: "/systemdesign/workspaces", icon: MonitorDot },
    { title: "Diagrams", value: stats?.diagrams || 0, href: "/systemdesign/diagrams", icon: Server },
  ];

  return (
    <div className="space-y-4 py-28 border-b">
      <DashboardSectionHeader title="System Design Overview" description="Metrics for system design topics and user content" />

      <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading system design metrics...">
        {!stats ? (
          <EmptyState message="No system design metrics available." />
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
