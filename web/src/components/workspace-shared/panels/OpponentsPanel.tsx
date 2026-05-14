import React from "react";
import { Users, Trophy, Medal, Timer, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArenaPlayer } from "@/types/arena";
import { cn, formatSolveTime } from "@/lib/utils";
import { useArenaStore } from "@/store/useArenaStore";
import type { OpponentsPanelProps } from "@/types/component.types";
import { useArenaRoomQuery } from "@/hooks/queries/use-arena.queries";
import { useAuth } from "@clerk/nextjs";
import { useShallow } from "zustand/react/shallow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RankIndicator } from "@/components/stats/leaderboard/RankIndicator";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export const OpponentsPanel = React.memo(({ roomId }: OpponentsPanelProps) => {
  const { userId: currentUserId } = useAuth();

  const storePlayers = useArenaStore(
    useShallow(
      (state: any) =>
        state.room?.players as Record<string, ArenaPlayer> | undefined,
    ),
  );

  const { data: roomMetadata } = useArenaRoomQuery(roomId);

  const participants = React.useMemo(() => {
    const players = storePlayers || roomMetadata?.players || {};
    return Object.values(players).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.testsPassed !== a.testsPassed) return b.testsPassed - a.testsPassed;
      const aTime = a.timeTaken ?? Infinity;
      const bTime = b.timeTaken ?? Infinity;
      if (aTime !== bTime) return aTime - bTime;
      if (a.status === "SUBMITTED" && b.status !== "SUBMITTED") return -1;
      if (b.status === "SUBMITTED" && a.status !== "SUBMITTED") return 1;
      return a.username.localeCompare(b.username);
    });
  }, [storePlayers, roomMetadata?.players]);

  return (
    <ScrollArea className="h-full">
      <div className="p-0">
        <div className="p-4 flex items-center justify-between border-b border-border/40 bg-muted/20">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Participants ({participants.length})
          </h3>
        </div>

        {participants.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 grayscale">
            <Users className="size-12 mb-4" />
            <p className="text-sm text-muted-foreground/60 font-medium">No participants yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/10 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-10 text-center text-[10px] font-black uppercase tracking-tighter">#</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0">Player</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">Tests</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-4">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((player: ArenaPlayer, index: number) => {
                const isMe = player.userId === currentUserId;
                const isOffline = player.isOffline;

                return (
                  <TableRow
                    key={player.userId}
                    className={cn(
                      "group transition-colors border-border/40",
                      index === 0 && "bg-rank-1-row",
                      index === 1 && "bg-rank-2-row",
                      index === 2 && "bg-rank-3-row",
                      isOffline && "opacity-50 grayscale"
                    )}
                  >
                    <TableCell className="py-3 px-2 text-center">
                      {player.submissionOrder && player.submissionOrder > 0 ? (
                        <RankIndicator rank={player.submissionOrder} />
                      ) : (
                        <div className="flex items-center justify-center h-7 w-7 mx-auto text-xs text-muted-foreground/70">
                          -:-
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 pl-0">
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <Avatar className="size-8 border border-border/40 shadow-sm">
                            <AvatarImage src={player.avatarUrl} />
                            <AvatarFallback className="text-xs font-bold bg-muted">
                              {player.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background shadow-sm",
                              isOffline ? "bg-muted-foreground" : "bg-secondary",
                            )}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className={cn(
                              "text-sm font-bold truncate leading-none",
                              isMe ? "text-primary" : "text-foreground"
                            )}>
                              {player.fullName || player.username}
                            </span>
                            {isMe && (
                              <Badge className="text-[10px]">
                                Me
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground/50 truncate leading-none mt-1">
                            {player.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-[10px] font-black text-muted-foreground/60 tabular-nums uppercase tracking-widest">
                        {player.testsPassed}/{player.totalTests}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-right pr-4">
                      <div className="flex flex-col items-end justify-center gap-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest p-1",
                            player.status === "SUBMITTED"
                              ? "bg-status-accepted text-status-accepted"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {player.status}
                        </Badge>
                        {player.timeTaken && (
                          <Badge className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span className="text-xs font-bold tabular-nums tracking-tighter uppercase">
                              {formatSolveTime(player.timeTaken)}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </ScrollArea>
  );
});
