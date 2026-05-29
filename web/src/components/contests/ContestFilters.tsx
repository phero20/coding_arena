"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContestStore } from "@/store/use-contest-store";

const PLATFORMS = [
  "Codeforces",
  "LeetCode",
  "AtCoder",
  "CodeChef",
  "Meta",
  "Google",
  "HackerRank",
];

export const ContestFilters: React.FC = () => {
  const { filters, togglePlatformFilter, setSearch, clearFilters } = useContestStore();
  const activeFiltersCount = filters.platforms.length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 md:max-w-md">
        <Input
          placeholder="Search for a specific round..."
          className=""
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
        <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Platforms:</span>
        </div>
        
        <div className="flex items-center gap-2">
          {PLATFORMS.map((platform) => {
            const isSelected = filters.platforms.includes(platform.toLowerCase());
            return (
              <Badge
                key={platform}
                variant={isSelected ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap px-3 py-1 text-sm font-medium transition-colors ${
                  isSelected ? "shadow-sm" : "hover:bg-primary hover:text-primary-foreground"
                }`}
                onClick={() => togglePlatformFilter(platform.toLowerCase())}
              >
                {platform}
              </Badge>
            );
          })}
        </div>

        {(activeFiltersCount > 0 || filters.search) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={clearFilters}
            className=""
          >
            Clear <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};


