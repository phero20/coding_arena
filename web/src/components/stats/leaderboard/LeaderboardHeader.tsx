"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Trophy } from "lucide-react";
import { useLeaderboardStore } from "@/store/use-leaderboard-store";

export function LeaderboardHeader() {
  const { searchQuery, setSearchQuery } = useLeaderboardStore();

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Global Rankings
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Global standings and overall user rankings across the platform.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search users by handle or name..."
            className="pl-10 h-11 bg-card/50 border-border/60 hover:border-border transition-all focus-visible:ring-1 focus-visible:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
