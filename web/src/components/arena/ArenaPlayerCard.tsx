import { memo } from "react";
import { ArenaPlayer } from "@/services/arena.service";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, X, Timer } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatSolveTime } from "@/lib/utils";

interface ArenaPlayerCardProps {
  player: ArenaPlayer;
  isHost?: boolean;
  canKick?: boolean;
  onKick?: (userId: string) => void;
}

export const ArenaPlayerCard = memo(function ArenaPlayerCard({ 
  player, 
  isHost, 
  canKick, 
  onKick 
}: ArenaPlayerCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 border-2",
      player.isCreator ? "border-primary shadow-sm" : "border-border/50"
    )}>
      <CardContent className="p-2.5 flex items-center justify-between gap-3 min-w-0 relative group">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 border-2 border-background shadow-xs">
            <AvatarImage src={player.avatarUrl} alt={player.username} />
            <AvatarFallback className="text-[10px] font-black uppercase bg-muted">
              {player.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs truncate text-foreground/80 lowercase tracking-tight">
                {player.username}
              </span>
              {player.isCreator && (
                <Badge variant="secondary" className="h-4 px-1 text-[8px] font-black uppercase tracking-tighter bg-primary/20 text-primary border-none">
                  Host
                </Badge>
              )}
            </div>
            {player.timeTaken && (
              <div className="flex items-center gap-1 mt-0.5">
                <Timer className="size-2.5 text-primary" />
                <span className="text-[10px] font-extrabold text-primary/80 tracking-tight">
                  {formatSolveTime(player.timeTaken)}
                </span>
              </div>
            )}
          </div>
        </div>

        {canKick && onKick && (
          <Button
            size="icon"
            variant="destructive"
            className="h-6 w-6"
            onClick={() => onKick(player.userId)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
      