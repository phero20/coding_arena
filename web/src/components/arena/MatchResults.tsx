import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, User, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArenaPlayerResult } from "@/services/arena.service";

interface MatchResultsProps {
  rankings: ArenaPlayerResult[];
  isHost: boolean;
  onClose: () => void;
}

export function MatchResults({ rankings, isHost, onClose }: MatchResultsProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground/50 font-bold ml-1.5">{rank}</span>;
    }
  };

  const getVerdictBadge = (verdict: string) => {
    const isAccepted = verdict === "ACCEPTED";
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider border-none",
          isAccepted 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-rose-500/10 text-rose-400"
        )}
      >
        {verdict.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 text-center">
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic opacity-90">
            Battle Summary
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Match results finalized and verified
          </p>
        </div>
      </div>

      <Card className="w-full border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="pb-0 border-b border-border/10">
          <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60 py-4">
            Final Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent border-border/10">
                <TableHead className="w-[80px] text-center">Rank</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Tests</TableHead>
                <TableHead className="text-right pr-8">Verdict</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((player) => (
                <TableRow 
                  key={player.userId}
                  className={cn(
                  "group border-border/5 hover:bg-primary/5 transition-colors",
                  player.finalRank === 1 && "bg-primary/10"
                )}
                >
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getRankIcon(player.finalRank || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border/20 shadow-sm">
                        <AvatarImage src={player.avatarUrl} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground/80 leading-tight">
                          {player.username}
                        </span>
                        {player.submittedAt && (
                          <span className="text-[9px] text-muted-foreground/50 font-medium">
                            {new Date(player.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-primary">
                    {player.score}
                  </TableCell>
                  <TableCell className="text-center font-medium text-muted-foreground/80">
                    {player.testsPassed} / {player.totalTests}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {getVerdictBadge(player.verdict)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 w-full justify-center">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="px-8 font-bold gap-2 border-border/40"
        >
          <LogOut className="w-4 h-4" />
          Leave Arena
        </Button>
      </div>
    </div>
  );
}
