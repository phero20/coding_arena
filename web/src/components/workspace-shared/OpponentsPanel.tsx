import React from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArenaRoom } from "@/services/arena.service";
import { cn } from "@/lib/utils";

interface OpponentsPanelProps {
  room?: ArenaRoom | null;
  currentUserId?: string | null;
}

export const OpponentsPanel = React.memo(
  ({ room, currentUserId }: OpponentsPanelProps) => {
    const participants = React.useMemo(() => {
      if (!room?.players) return [];
      return Object.values(room.players);
    }, [room?.players]);

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
              {participants.map((player) => {
                const isMe = player.userId === currentUserId;
                const isOffline = player.isOffline;

                return (
                  <Card
                    key={player.userId}
                    className={cn(
                      "p-3 transition-all duration-300",
                      isOffline && "opacity-50 grayscale",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            player.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`
                          }
                          className="size-10 rounded-full border border-border/40 shadow-sm"
                          alt={player.username}
                        />
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background shadow-sm",
                            isOffline ? "bg-muted-foreground" : "bg-secondary",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                          {player.username}
                          {isMe && (
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-1 py-0.5 rounded leading-none">
                              You
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-1.5 h-5 border-none",
                              player.status === "SUBMITTED"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {player.status}
                          </Badge>
                          {isOffline && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-black uppercase tracking-widest px-1.5 h-5 bg-muted text-muted-foreground border-none"
                            >
                              OFFLINE
                            </Badge>
                          )}
                          <span className="text-[10px] font-bold text-muted-foreground/60">
                            {player.testsPassed} / {player.totalTests} Tests
                          </span>
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
  },
);
