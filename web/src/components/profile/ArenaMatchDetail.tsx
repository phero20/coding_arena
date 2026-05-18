"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Timer,
  Code2,
  ShieldCheck,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatSolveTime } from "@/lib/utils";
import type { ArenaMatch } from "@/types/arena";
import { format } from "date-fns";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";

interface ArenaMatchDetailProps {
  match: ArenaMatch;
  onBack: () => void;
}

const difficultyClasses: Record<string, string> = {
  Easy: "text-difficulty-easy border-difficulty-easy bg-difficulty-easy/10",
  Medium:
    "text-difficulty-medium border-difficulty-medium bg-difficulty-medium/10",
  Hard: "text-difficulty-hard border-difficulty-hard bg-difficulty-hard/10",
};

export const ArenaMatchDetail: React.FC<ArenaMatchDetailProps> = ({
  match,
  onBack,
}) => {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button size="icon" onClick={onBack} variant="outline">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-black tracking-tight truncate flex items-center gap-3">
              {match.problemTitle || match.problemSlug || "Arena Match"}
              <div className="flex items-center gap-1.5 translate-y-[1px]">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold px-1.5"
                >
                  {match.language}
                </Badge>
              </div>
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              {match.difficulty && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] uppercase font-black px-1.5 py-0",
                    difficultyClasses[match.difficulty],
                  )}
                >
                  {match.difficulty}
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-3 w-3 opacity-50" />
                {format(new Date(match.startedAt), "PPP p")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Card */}
      <Card className="overflow-hidden border-border/40 shadow-xl shadow-background/20 bg-card/30 backdrop-blur-md">
        <CardHeader className="border-b border-border/10 bg-muted/20 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Leaderboard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/10">
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
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Verdict
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground text-center">
                  Code
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {match.players
                .sort(
                  (a, b) =>
                    (a.submissionOrder || 999) - (b.submissionOrder || 999),
                )
                .map((player, index) => {
                  const isExpanded = expandedUserId === player.userId;

                  return (
                    <React.Fragment key={player.userId}>
                      <TableRow
                        className={cn(
                          "group cursor-pointer transition-colors border-b border-border/5",
                          isExpanded && "bg-muted/50 border-primary/20",
                        )}
                        onClick={() => toggleExpand(player.userId)}
                      >
                        <TableCell className="pl-6 py-4">
                          <div
                            className={cn(
                              "h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-black ring-1 ring-inset",
                            )}
                          >
                            {player.submissionOrder || "--"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <Avatar className="h-8 w-8 border border-border/20">
                              <AvatarImage src={player.avatarUrl} />
                              <AvatarFallback className="bg-muted text-[10px] font-bold">
                                {player.username?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <Link
                                href={`/u/${player.username}`}
                                className="font-bold text-sm tracking-tight truncate text-primary group-hover:underline transition-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {player.fullName || player.username}
                              </Link>
                              <span className="text-[10px] text-muted-foreground tracking-widest">
                                {player.username}
                              </span>
                            </div>
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
                            <span className="text-xs font-black text-primary tabular-nums">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(player.userId);
                            }}
                          >
                            <Code2 className="w-3 h-3" />
                            Code
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-muted hover:bg-muted">
                          <TableCell colSpan={7} className="p-0">
                            <div className="animate-in slide-in-from-top-2 duration-300">
                              {player.sourceCode ? (
                                <div className="relative">
                                  <SyntaxHighlighter
                                    language={
                                      player.languageId?.toLowerCase() ||
                                      match.language?.toLowerCase() ||
                                      "javascript"
                                    }
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
                              ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                                  <ShieldCheck className="size-8 mb-2" />
                                  <p className="text-[10px] font-black uppercase italic">
                                    Code not available.
                                  </p>
                                </div>
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
};
