"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
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
    <div className="flex flex-col gap-4 justify-between pb-2 mt-4 md:my-8 border-b pb-6">
      <div className="space-y-1">
       <h3 className="text-2xl font-semibold tracking-tight text-foreground">All Contests</h3>
        <p className="text-sm text-muted-foreground">Filter by platform or search for specific rounds.</p>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search contests..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/40 border-border focus-visible:ring-primary h-11"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground mr-1">
            <Filter className="h-4 w-4" />
          </div>
          {PLATFORMS.map((platform) => {
            const isSelected = filters.platforms.includes(platform.toLowerCase());
            return (
              <Badge
                key={platform}
                variant={isSelected ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected ? "shadow-sm" : "hover:bg-primary/20 hover:text-primary bg-muted/60"
                }`}
                onClick={() => togglePlatformFilter(platform.toLowerCase())}
              >
                {platform}
              </Badge>
            );
          })}
          
          {(activeFiltersCount > 0 || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2.5 text-muted-foreground hover:text-destructive shrink-0 ml-1 font-semibold"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
