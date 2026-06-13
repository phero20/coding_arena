import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RankIndicator } from "../stats/leaderboard/RankIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeViewer } from "@/components/ui/code-viewer";
import { cn, formatSolveTime } from "@/lib/utils";
import { ArenaPlayerResult } from "@/types/arena";
import type { MatchResultsProps } from "@/types/component.types";
import {
  LogOut,
  Code2,
  Clock,
} from "lucide-react";
import Link from "next/link";

import { useMatchRanking } from "@/hooks/arena/use-match-ranking";

import { VerdictBadge } from "@/components/ui/verdict-badge";

import { tones } from "@/lib/tones";
import { ArenaLogo } from "./ArenaLogo";




export function MatchResults({ rankings, isHost, onClose }: MatchResultsProps) {
  const { sortedRankings, topThree, expandedUser, setExpandedUser } =
    useMatchRanking(rankings);

  return (
    <div className="relative min-h-screen pb-20 flex flex-col items-center w-full max-w-6xl mx-auto px-0 py-8 space-y-4">

      
      {/* Header Section */}
      <div className="w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 md:w-12 md:h-12  shrink-0">
            <ArenaLogo className="w-full h-full hover:scale-105 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
            Match Ranking
          </h1>
        </div>

        <Button variant="destructive" size="sm" onClick={onClose}>
          <LogOut className="size-4" /> <span className="hidden md:block">Exit Arena</span>
        </Button>
      </div>

      {/* Podium Section */}
      <div className="flex flex-row items-center justify-center gap-2 w-full max-w-3xl relative z-10">
        {topThree[1] && (
          <div className="order-1">
            <PodiumProfile
              player={topThree[1]}
              rank={2}
              size="md"
              onExpand={setExpandedUser}
            />
          </div>
        )}
        {topThree[0] && (
          <div className="order-2">
            <PodiumProfile
              player={topThree[0]}
              rank={1}
              size="lg"
              onExpand={setExpandedUser}
            />
          </div>
        )}
        {topThree[2] && (
          <div className="order-3">
            <PodiumProfile
              player={topThree[2]}
              rank={3}
              size="sm"
              onExpand={setExpandedUser}
            />
          </div>
        )}
      </div>

      {/* Main Leaderboard Card */}
      <Card className="overflow-hidden w-full relative z-10 bg-card">
        <CardHeader className="py-4">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 shrink-0">
            <ArenaLogo className="w-full h-full hover:scale-105 transition-transform duration-300" />
          </div>
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Leaderboard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="">
                <TableHead className="w-[80px] text-[10px] font-black uppercase text-muted-foreground pl-6">
                  Rank
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">
                  Player
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Points
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Precision
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Speed
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-right">
                  Verdict
                </TableHead>
                <TableHead className="w-[100px] pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRankings.map((player, index) => {
                const isExpanded = expandedUser === player.userId;
                return (
                  <React.Fragment key={player.userId}>
                    <TableRow
                      className={cn(
                        "group cursor-pointer transition-colors",
                        index === 0 && "bg-rank-1-row",
                        index === 1 && "bg-rank-2-row",
                        index === 2 && "bg-rank-3-row",
                        isExpanded && "bg-muted/50",
                      )}
                      onClick={() =>
                        setExpandedUser(isExpanded ? "" : player.userId)
                      }
                    >
                      <TableCell
                        className={cn(
                          "pl-6 py-4 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        <RankIndicator rank={index + 1} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-4 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        <div className="pr-4 min-w-[140px] flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border/20">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback className="bg-muted text-[10px] font-bold">
                              {player.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/u/${player.username}`}
                            className="flex flex-col"
                          >
                            <span className="font-bold text-sm tracking-tight truncate text-primary group-hover:underline transition-all">
                              {player.fullName || player.username}
                            </span>
                            {player.fullName && (
                              <span className="text-[10px] text-muted-foreground tracking-widest">
                                {player.username}
                              </span>
                            )}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-center py-4 font-black text-sm tabular-nums border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        {player.score || 0}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-center py-4 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-status-accepted">
                            {player.testsPassed}/{player.totalTests}
                          </span>
                          <span className="text-[10px] text-muted-foreground tracking-widest">
                            Tests Passed
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-center py-4 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-primary">
                            {formatSolveTime(player.timeTaken)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right py-4 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        <div className="flex justify-end">
                          <VerdictBadge verdict={player.verdict} />
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right pr-6 py-4 border-b transition-colors",
                          isExpanded ? "border-primary/20" : "border-border/5",
                        )}
                      >
                        <Button size="sm" disabled={!player.sourceCode}>
                          <Code2 className="w-3 h-3" />
                          Code
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20 border-none">
                        <TableCell colSpan={7} className="p-0 border-none">
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            {!player.sourceCode ? (
                              <div className="flex flex-col gap-2 items-center justify-center py-10  text-center text-muted-foreground">
                                <Code2 className="size-6" />
                                <p className="text-sm font-black ">
                                  User has not submitted any solution.
                                </p>
                              </div>
                            ) : (
                              <CodeViewer
                                code={player.sourceCode}
                                language={player.languageId || "javascript"}
                                label={`${player.languageId || "javascript"}`}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PodiumProfile({
  player,
  rank,
  size,
  onExpand,
}: {
  player: ArenaPlayerResult;
  rank: number;
  size: "sm" | "md" | "lg";
  onExpand: (userId: string) => void;
}) {
  const sizes = {
    sm: "size-14 md:size-20",
    md: "size-16 md:size-24",
    lg: "size-24 md:size-32",
  };

  const tone = tones[rank - 1] || tones[0];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 md:gap-3 shrink-0 group",
        rank === 1 ? "mb-0 md:mb-6" : "mb-0",
      )}
    >
      <div
        className={cn("relative cursor-pointer rounded-full p-1 transition-all", tone.ring)}
        onClick={() => onExpand(player.userId)}
      >
        <Avatar
          className={cn(
            "border-[3px] transition-all",
            sizes[size],
            tone.chipBorder
          )}
        >
          <AvatarImage src={player.avatarUrl} />
          <AvatarFallback className="text-lg md:text-xl font-black italic bg-muted">
            {player.username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Badge
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] md:text-[11px] font-black z-10 border hover:bg-transparent rounded-full backdrop-blur-md",
            tone.chipBg,
            tone.chipBorder,
            tone.accent
          )}
        >
          {rank}
        </Badge>
      </div>
      <div className="text-center max-w-[120px] flex flex-col items-center gap-1 mt-2">
        <Link
          href={`/u/${player.username}`}
          className={cn(
            "font-bold text-xs md:text-sm truncate w-full tracking-tight hover:underline transition-colors",
            tone.accent,
            tone.hoverAccent
          )}
        >
          {player.fullName || player.username}
        </Link>
        <div className="flex flex-col items-center gap-1">
          {player.fullName && (
            <p className="text-[10px] text-muted-foreground truncate w-full tracking-tight -mt-1">
              {player.username}
            </p>
          )}
          {player.timeTaken && (
            <Badge className={cn("flex gap-1 hover:bg-transparent",tone.chipBg,
            tone.chipBorder,
            tone.accent )}>
              <Clock className="size-3" />
              <span className="text-xs font-bold tabular-nums mb-0.5">
                {formatSolveTime(player.timeTaken)}
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
