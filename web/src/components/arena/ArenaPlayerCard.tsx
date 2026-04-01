import { memo } from "react";
import { ArenaPlayer } from "@/services/arena.service";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArenaPlayerCardProps {
  player: ArenaPlayer;
}

export const ArenaPlayerCard = memo(function ArenaPlayerCard({ player }: ArenaPlayerCardProps) {
  return (
    <Card className={cn(
      "border-border/50",
      player.isReady ? "border-primary/50 bg-primary/5" : "bg-card"
    )}>
      <CardContent className="p-4 flex items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 border border-border shrink-0">
            <AvatarImage src={player.avatarUrl} alt={player.username} />
            <AvatarFallback className="text-xs font-bold">
              {player.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm truncate">{player.username}</span>
              {player.isCreator && (
                <Badge variant="outline" className="text-[9px] h-3.5 px-1 shrink-0 uppercase tracking-tighter">
                  Host
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
              {player.status === "CODING" ? "Preparing" : "Ready"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {player.isReady ? (
            <Badge className="bg-primary hover:bg-primary pointer-events-none">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          ) : (
            <Badge variant="secondary" className="pointer-events-none">
              <CircleDashed className="w-3 h-3 mr-1 animate-spin" />
              Waiting
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
