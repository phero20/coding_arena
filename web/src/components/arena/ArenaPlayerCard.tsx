import { memo } from "react";
import { ArenaPlayer } from "@/services/arena.service";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { Badge } from "../ui/badge";

interface ArenaPlayerCardProps {
  player: ArenaPlayer;
}

export const ArenaPlayerCard = memo(function ArenaPlayerCard({ player }: ArenaPlayerCardProps) {
  return (
    <Card className={`${player.isCreator ? "border-primary" : ""}`}>
      <CardContent className="p-2.5 flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={player.avatarUrl} alt={player.username} />
            <AvatarFallback className="text-[10px] font-black uppercase">
              {player.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs truncate text-foreground/80 lowercase tracking-tight">
                {player.username}
              </span>
              {player.isCreator && <Badge variant="secondary">Host</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
      