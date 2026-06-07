import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ArenaPlayerCardProps } from "@/types/component.types";
import { X, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatSolveTime } from "@/lib/utils";



export const ArenaPlayerCard = memo(function ArenaPlayerCard({ 
  player, 
  isHost, 
  canKick, 
  onKick,
  tone
}: ArenaPlayerCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 border-2",
        !tone && (player.isCreator ? "border-primary shadow-sm" : "border-border/50"),
        tone && "shadow-sm"
      )}
      style={{
        borderColor: tone ? tone.fill : undefined,
      }}
    >
      <CardContent className="p-2.5 flex items-center justify-between gap-3 min-w-0 relative group">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar 
            className="h-8 w-8 border-2 shadow-xs bg-background"
            style={{ borderColor: tone ? tone.fill : "var(--background)" }}
          >
            <AvatarImage src={player.avatarUrl} alt={player.username} />
            <AvatarFallback className="text-[10px] font-black uppercase bg-muted">
              {player.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-xs truncate text-primary tracking-tight">
                {player.fullName || player.username}
              </span>
              {player.isCreator && (
                <Badge variant="outline" className="h-4 px-1 text-[8px] font-black uppercase -tracking-normal text-primary ">
                  Host
                </Badge>
              )}
            </div>
            {player.fullName && (
              <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                {player.username}
              </span>
            )}
            {player.timeTaken && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="size-2.5 text-primary" />
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
            title="Remove"
            onClick={() => onKick(player.userId)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
      