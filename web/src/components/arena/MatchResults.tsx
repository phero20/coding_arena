import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn, formatSolveTime } from "@/lib/utils";
import { ArenaPlayerResult } from "@/types/arena";
import type { MatchResultsProps } from "@/types/component.types";
import {
  LogOut,
  Trophy,
  Eye,
  Code2,
  Terminal,
  Info,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

import { useMatchRanking } from "@/hooks/arena/use-match-ranking";

import { VerdictBadge } from "@/components/ui/verdict-badge";

export function MatchResults({ rankings, isHost, onClose }: MatchResultsProps) {
  const { sortedRankings, topThree, expandedUser, setExpandedUser } =
    useMatchRanking(rankings);

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center w-full max-w-4xl mx-auto px-0 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="w-full flex items-center justify-between py-2 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
            Match Results
          </h1>
        </div>

        <Button variant="destructive" size="sm" onClick={onClose}>
          <LogOut className="size-4 mr-2" /> <span>Exit Arena</span>
        </Button>
      </div>

      {/* Podium Section */}
      <div className="flex flex-row items-center justify-center gap-2 w-full max-w-3xl">
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
      <Card className="overflow-hidden w-full">
        <CardHeader className="border-b border-border/10 bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
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
                  Score
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
                        "group cursor-pointer",

                        isExpanded && "border-b border-primary",
                      )}
                      onClick={() =>
                        setExpandedUser(isExpanded ? "" : player.userId)
                      }
                    >
                      <TableCell className="pl-6 py-4">
                        <Badge className="">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="pr-4 min-w-[140px] flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border/20">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback className="bg-muted text-[10px] font-bold">
                              {player.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Link href={`/u/${player.username}`} className="flex flex-col">
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
                      <TableCell className="text-center py-4 font-black text-sm tabular-nums">
                        {player.score || 0}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-status-accepted">
                            {player.testsPassed}/{player.totalTests}
                          </span>
                          <span className="text-[10px] text-muted-foreground tracking-widest">
                            Tests Passed
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-primary">
                            {formatSolveTime(player.timeTaken)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end">
                          <VerdictBadge verdict={player.verdict} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Button
                          size="sm"
                         
                          disabled={!player.sourceCode}
                        >
                          <Code2 className="w-3 h-3" />
                          Code
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableCell
                          colSpan={7}
                          className=""
                        >
                          {!player.sourceCode ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                              <Eye className="size-8 mb-2" />
                              <p className="text-[10px] font-black uppercase italic">
                                Code not available.
                              </p>
                            </div>
                          ) : (
                            <div className="relative">
                              <SyntaxHighlighter
                                language={player.languageId || "javascript"}
                                style={vscDarkPlus}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  padding: "1.5rem",
                                  fontSize: "0.75rem",
                                  lineHeight: "1.8",
                                  background: "transparent",
                                  overflowX: "hidden",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-all",
                                }}
                                codeTagProps={{
                                  style: {
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-all",
                                    display: "block",
                                    maxWidth: "100%",
                                  },
                                }}
                              >
                                {player.sourceCode}
                              </SyntaxHighlighter>
                            </div>
                          )}
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
    lg: "size-24 md:size-32 border-primary",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 md:gap-3 shrink-0",
        rank === 1 ? "mb-0 md:mb-6" : "mb-0",
      )}
    >
      <div
        className="relative group cursor-pointer"
        onClick={() => onExpand(player.userId)}
      >
        <Avatar
          className={cn(
            "border-4 border-card shadow-2xl transition-all group-hover:scale-105 group-hover:border-primary/50",
            sizes[size],
          )}
        >
          <AvatarImage src={player.avatarUrl} />
          <AvatarFallback className="text-lg md:text-xl font-black italic">
            {player.username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black z-10 shadow-lg",
            rank === 1
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground border",
          )}
        >
          {rank}
        </div>
      </div>
      <div className="text-center max-w-[120px] flex flex-col items-center gap-1">
        <Link href={`/u/${player.username}`} className="font-semibold text-xs md:text-sm truncate w-full tracking-tight text-primary">
          {player.fullName || player.username}
        </Link>
        {player.fullName && (
          <p className="text-[10px] text-muted-foreground truncate w-full -mt-1 tracking-tight">
            {player.username}
          </p>
        )}
        {player.timeTaken && (
          <Badge className="flex gap-1">
            <Clock className="size-3" />
            {formatSolveTime(player.timeTaken)}
          </Badge>
        )}
      </div>
    </div>
  );
}
