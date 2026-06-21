"use client";

import { useUserCounts } from "@/hooks/useUserAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight, Users, CheckCircle, Code2, GraduationCap, FileCode2, Target, Swords, Sword } from "lucide-react";
import { DashboardSectionHeader } from "./shared/DashboardSectionHeader";

export function UserSection() {
  const { counts, isLoading, isError, error } = useUserCounts();

  const statItems = [
    { title: "Total Users", value: counts?.users || 0, href: "/users/all-users", icon: Users },
    { title: "Solved Problems", value: counts?.userSolvedProblems || 0, href: "users/solved-problems", icon: CheckCircle },
    { title: "Solved Languages", value: counts?.userSolvedLanguages || 0, href: "users/solved-languages", icon: Code2 },
    { title: "Academy Exercises", value: counts?.userAcademyExercises || 0, href: "academy-exercises", icon: GraduationCap },
    { title: "Code Solutions", value: counts?.solutions || 0, href: "/users/solutions", icon: FileCode2 },
    { title: "Judge Submissions", value: counts?.totalSubmissions || 0, href: "/users/all-users", icon: Target },
    { title: "Arena Matches", value: counts?.arenaMatches || 0, href: "/users/all-users", icon: Swords },
    { title: "Arena Submissions", value: counts?.arenaSubmissions || 0, href: "/users/all-users", icon: Sword },
  ];

  return (
    <div className="space-y-4 py-20">
      <DashboardSectionHeader title="Users & Engagement" description="Overall statistics on user registrations and platform activity" />

      <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading user metrics...">
        {!counts ? (
          <EmptyState message="No user metrics available." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, idx) => {
              return (
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
              );
            })}
          </div>
        )}
      </QueryState>
    </div>
  );
}
