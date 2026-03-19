"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import type { Problem } from "@/types/api";

export type DifficultyFilter = "All" | Problem["difficulty"];

interface ProblemFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (value: DifficultyFilter) => void;
  topicFilter: string;
  setTopicFilter: (value: string) => void;
  onReset: () => void;
  isSelectPage: boolean;
}

export const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  search,
  setSearch,
  difficultyFilter,
  setDifficultyFilter,
  topicFilter,
  setTopicFilter,
  onReset,
  isSelectPage,
}) => {
  return (
    <header className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isSelectPage ? "Select Problem" : "Practice"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            {isSelectPage
              ? "Browse and select a challenge for your arena match."
              : "Solve curated problems to sharpen your skills before entering the arena."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <ButtonGroup>
              {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map(
                (d) => (
                  <Button
                    key={d}
                    variant={difficultyFilter === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficultyFilter(d)}
                    className="rounded-lg px-3 py-1 text-xs font-semibold h-8"
                  >
                    {d}
                  </Button>
                ),
              )}
            </ButtonGroup>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug"
            className="h-10 flex-1 border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            placeholder="Topic (e.g. Array)"
            className="h-10 w-40 border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
};
