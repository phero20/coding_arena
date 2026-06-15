"use client";

import React from "react";
import { ContestCard } from "./ContestCard";
import { useContestStore } from "@/store/use-contest-store";

import { Trophy } from "lucide-react";

import { type Contest } from "@/types/contest";

interface ContestListProps {
  contests: Contest[];
}

export const ContestList: React.FC<ContestListProps> = ({ contests }) => {
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

  if (!filteredContests || filteredContests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center mt-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Trophy className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
          No Contests Found
        </h3>
        <p className="text-muted-foreground max-w-md">
          We couldn't find any contests matching your current platform or search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredContests.map((contest) => (
        <ContestCard key={contest.id} contest={contest} />
      ))}
    </div>
  );
};

