import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardEntry } from "@/types/stats";
import Link from "next/link";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isViewer?: boolean;
}

import { RankIndicator } from "./RankIndicator";

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, isViewer }) => {
  return (
    <TableRow 
      className={cn(
        "group transition-colors border-border/40",
        entry.rank === 1 && "bg-rank-1-row",
        entry.rank === 2 && "bg-rank-2-row",
        entry.rank === 3 && "bg-rank-3-row",
      )}
    >
      <TableCell className="pl-0 md:pl-4 pr-0 md:pr-4 py-3 w-12 text-center">
        <RankIndicator rank={entry.rank} />
      </TableCell>
      <TableCell className="pl-0 md:pl-6 py-3">
        <Link 
          href={`/u/${entry.username}`}
          className="flex items-center gap-3 w-fit max-w-[140px] sm:max-w-[280px]"
        >
          <Avatar className="h-9 w-9 border border-border/60 flex-shrink-0">
            <AvatarImage src={entry.avatarUrl || ""} />
            <AvatarFallback className="bg-muted text-[10px] font-bold">
              {entry.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground leading-tight truncate">
                {entry.fullName || entry.username}
              </span>
              {isViewer && (
                <Badge>
                  You
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium truncate hover:underline">
              {entry.username}
            </span>
          </div>
        </Link>
      </TableCell>
      <TableCell className="px-4 md:px-6 py-3 text-center font-mono text-sm font-medium text-muted-foreground w-20 sm:w-32">
        {entry.totalSolved || 0}
      </TableCell>
      <TableCell className="px-4 md:px-6 py-3 text-right font-mono text-base font-bold text-foreground pr-4 md:pr-8 w-24 sm:w-28">
        {(entry.points || 0).toLocaleString()}
      </TableCell>
    </TableRow>
  );
};
