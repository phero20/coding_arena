"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { useArenaHistoryQuery, useArenaMatchDetailsQuery } from "@/hooks/queries/use-arena.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { ArenaMatchCard } from "./ArenaMatchCard";
import { ArenaMatchDetail } from "./ArenaMatchDetail";
import { ArenaHistorySkeleton } from "@/components/skeletons/ArenaSkeletons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ArenaMatch } from "@/types/arena";

interface ArenaHistoryTabProps {  
  userId: string;
}

export const ArenaHistoryTab: React.FC<ArenaHistoryTabProps> = ({ userId }) => {
  const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null);
  const { userId: currentClerkId } = useAuth();
  const { data: matches, isLoading, error, refetch } = useArenaHistoryQuery(userId);
  
  const { 
    data: detailedMatch, 
    isLoading: isDetailLoading,
    error: detailError 
  } = useArenaMatchDetailsQuery(selectedMatchId);

  if (selectedMatchId) {
    return (
      <QueryGuard
        loading={isDetailLoading}
        error={detailError}
        data={detailedMatch}
        onRetry={() => {}}
        skeleton={<ArenaHistorySkeleton />}
      >
        {(match) => (
          <ArenaMatchDetail 
            match={match} 
            onBack={() => setSelectedMatchId(null)} 
          />
        )}
      </QueryGuard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            ARENA RECORDS
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">
           Match History
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
          >
            {matches?.length || 0} TOTAL MATCHES
          </Badge>
        </div>
      </div>

      <QueryGuard
        loading={isLoading}
        error={error}
        data={matches}
        skeleton={<ArenaHistorySkeleton />}
        onRetry={refetch}
        emptyTitle="Arena Empty"
        emptyMessage="You haven't played any matches yet. Ready to start?"
        emptyAction={
          <Link href="/arena">
            <Button size="sm" className="font-bold tracking-tight">
              ENTER THE ARENA
            </Button>
          </Link>
        }
      >
        {(matchList) => (
          <div className="grid gap-4">
            {matchList.map((match) => (
              <ArenaMatchCard
                key={match.id}
                match={match}
                currentUserId={userId}
                onSelect={(m) => setSelectedMatchId(m.id)}
              />
            ))}
          </div>
        )}
      </QueryGuard>
    </div>
  );
};
