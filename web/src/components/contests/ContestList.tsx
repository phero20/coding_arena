"use client";

import React from "react";
import { ContestCard } from "./ContestCard";
import { useContestStore } from "@/store/use-contest-store";
import { useUpcomingContestsQuery } from "@/hooks/queries/use-contest.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ContestListSkeleton } from "@/components/skeletons";
import { Trophy } from "lucide-react";


export const ContestList: React.FC = () => {
  const { data: contests, isLoading, error, refetch } = useUpcomingContestsQuery();
  const { filters } = useContestStore();

  const filteredContests = React.useMemo(() => {
    if (!contests) return [];
    return contests.filter((contest) => {
      const matchesPlatform = filters.platforms.length === 0 || 
        filters.platforms.some(p => contest.platform.toLowerCase().includes(p.toLowerCase()));
      const matchesSearch = !filters.search || 
        contest.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        contest.platform.toLowerCase().includes(filters.search.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [contests, filters]);

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={filteredContests}
      onRetry={refetch}
      skeleton={<ContestListSkeleton />}
      emptyIcon={Trophy}
      emptyTitle="No Contests Found"
      emptyMessage="We couldn't find any contests matching your current platform or search filters."
    >
      {(data) => (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      )}
    </QueryGuard>
  );
};


