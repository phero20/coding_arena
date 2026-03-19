import React from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArenaRoom } from "@/services/arena.service";

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
                return (
                  <Card key={player.userId} className={cn("p-3")}>
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
                      </div>
                      <div>
                        <p className="text-sm font-bold flex items-center gap-1.5">
                          {player.username}
                          {isMe && (
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-1 py-0.5 rounded leading-none">
                              You
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-1.5 h-5",
                              player.status === "SUBMITTED"
                                ? "bg-emerald-500/10 text-emerald-500 border-none"
                                : "bg-primary/10 text-primary border-none",
                            )}
                          >
                            {player.status}
                          </Badge>
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

// Helper for conditional classes if not already available
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
