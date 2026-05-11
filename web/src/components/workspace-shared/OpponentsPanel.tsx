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



export const OpponentsPanel = React.memo(({ roomId }: OpponentsPanelProps) => {
  const { userId: currentUserId } = useAuth();

  // 1. Reactive Store Data (Live Updates)
  const storePlayers = useArenaStore(
    useShallow(
      (state: any) =>
        state.room?.players as Record<string, ArenaPlayer> | undefined,
    ),
  );

  // 2. Persistent Query Data (Metadata Fallback)
  const { data: roomMetadata } = useArenaRoomQuery(roomId);

  const participants = React.useMemo(() => {
    const players = storePlayers || roomMetadata?.players || {};
    return Object.values(players).sort((a, b) => {
      // 1. Sort by score / tests passed
      if (b.score !== a.score) return b.score - a.score;
      if (b.testsPassed !== a.testsPassed) return b.testsPassed - a.testsPassed;

      // 2. Speed tie-breaker
      const aTime = a.timeTaken ?? Infinity;
      const bTime = b.timeTaken ?? Infinity;
      if (aTime !== bTime) return aTime - bTime;

      // 3. Fallback to status
      if (a.status === "SUBMITTED" && b.status !== "SUBMITTED") return -1;
      if (b.status === "SUBMITTED" && a.status !== "SUBMITTED") return 1;

      // 4. Fallback to username
      return a.username.localeCompare(b.username);
    });
  }, [storePlayers, roomMetadata?.players]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Participants ({participants.length})
          </h3>
        </div>

        {participants.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 grayscale">
            <Users className="size-12 mb-4" />
            <p className="text-sm">No participants in the arena yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {participants.map((player: ArenaPlayer) => {
              const isMe = player.userId === currentUserId;
              const isOffline = player.isOffline;
              const rank = player.submissionOrder;

              return (
                <Card
                  key={player.userId}
                  className={cn(
                    "p-3 transition-all duration-300 relative border-border/40 hover:bg-muted/30",
                    isMe && "border-primary/30 bg-primary/5",
                    isOffline && "opacity-50 grayscale",
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* 1. Left Rank Identifier */}
                    <div className="shrink-0 flex items-center justify-center w-8">
                      {rank && rank > 0 ? (
                        <div
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm",
                            rank === 1
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {rank}
                        </div>
                      ) : (
                        <div className="size-8 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                          <div className="size-1 rounded-full bg-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* 2. Avatar with Status Dot */}
                    <div className="relative shrink-0">
                      <Avatar className="size-8 border border-border/40 shadow-sm">
                        <AvatarImage src={player.avatarUrl} />
                        <AvatarFallback className="text-[10px] uppercase bg-muted">
                          {player.username.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background shadow-sm",
                          isOffline ? "bg-muted-foreground" : "bg-secondary",
                        )}
                      />
                    </div>

                    {/* 3. Identity & Progress */}
                    <div className="grow min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold truncate">
                          {player.username}
                        </span>
                        {isMe && (
                          <span className="text-[8px] text-primary font-black uppercase tracking-tighter bg-primary/10 px-1 py-0.5 rounded leading-none shrink-0">
                            Me
                          </span>
                        )}
                      </div>
                      <div className="flex items-center  gap-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-1 h-3.5 border-none shrink-0 rounded-[2px]",
                            player.status === "SUBMITTED"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {player.status}
                        </Badge>
                        <span className="text-[9px] font-bold text-muted-foreground/50 whitespace-nowrap">
                          {player.testsPassed}/{player.totalTests} Tests
                        </span>
                        {player.timeTaken && (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 ml-auto py-1"
                          >
                            <Clock className="size-3" />
                            <span className="uppercase tracking-tighter translate-y-[0.5px]">
                              {formatSolveTime(player.timeTaken)}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ScrollArea>
  );
});
