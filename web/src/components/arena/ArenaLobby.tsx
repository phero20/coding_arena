import { useEffect, useState } from "react";
import { ArenaPlayerCard } from "./ArenaPlayerCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Sword,
  LogOut,
  Check,
  Edit2,
  Rocket,
  Loader2,
  Clock,
} from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArenaLobby } from "@/hooks/arena/use-arena-lobby";

interface ArenaLobbyProps {
  roomId: string;
}

export function ArenaLobby({ roomId }: ArenaLobbyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    room,
    players,
    isHost,
    isConnected,
    isStartingMatch,
    canStartMatch,
    copied,
    startMatch,
    copyInviteCode,
    leaveRoom,
    isLoading,
    updateMatchDuration,
    kickPlayer,
  } = useArenaLobby(roomId);

  const matchDuration = String(room?.matchDuration || 20);

  if (isLoading || !room) {
    return null; // Or a sub-skeleton, but the page handles this
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-6 md:gap-12 pt-28 md:pt-42 pb-20 duration-500 w-full min-h-screen",
        hasMounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0",
      )}
    >
      {/* Action Buttons */}
      <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-2 z-20 mb-6 md:mb-0 md:absolute md:top-24 md:right-0">
        <Select
          value={matchDuration}
          onValueChange={updateMatchDuration}
          disabled={!isHost}
        >
          <SelectTrigger
            className={cn(
              "h-8 md:h-9 w-[120px] bg-card",
              isHost ? "cursor-pointer" : "opacity-90",
            )}
          >
            <Clock className="w-3.5 h-3.5 mr-2 opacity-70" />
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">5 mins</SelectItem>
            <SelectItem value="10">10 mins</SelectItem>
            <SelectItem value="20">20 mins</SelectItem>
            <SelectItem value="30">30 mins</SelectItem>
            <SelectItem value="60">60 mins</SelectItem>
          </SelectContent>
        </Select>

        {isHost && (
          <Button
            size="sm"
            variant="default"
            className="h-8 md:h-9 px-3 md:px-4"
            onClick={startMatch}
            disabled={!canStartMatch || !isConnected || isStartingMatch}
          >
            {isStartingMatch ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-3.5 w-3.5" />
                Start Match
              </>
            )}
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          className="h-8 md:h-9 px-3 md:px-4"
          onClick={leaveRoom}
        >
          <LogOut className="mr-2 h-3.5 w-3.5 " />
          Leave
        </Button>
      </div>

      {/* Arena Header */}
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center border border-border/50">
          <Sword className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase italic opacity-90">
          Arena Lobby
        </h1>
      </div>

      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Card className="inline-flex items-center gap-4 py-3 px-6 min-h-16 h-auto max-w-[95vw] md:max-w-2xl flex-wrap md:flex-nowrap">
            <h2 className="text-lg font-bold text-foreground/90 leading-tight max-w-[200px] md:max-w-[400px] wrap-break-words">
              {room?.topic || "Custom Battle"}
            </h2>
            {room?.difficulty && (
              <Badge
                variant="outline"
                className={cn(
                  "font-black tracking-widest text-[10px] uppercase py-1 px-3 border-none",
                  room.difficulty === "Easy"
                    ? "bg-emerald-400/10 border-emerald-500/30 text-emerald-400"
                    : room.difficulty === "Medium"
                      ? "bg-amber-400/10 border-amber-500/30 text-amber-400"
                      : "bg-rose-400/10 border-rose-500/30 text-rose-400",
                )}
              >
                {room.difficulty}
              </Badge>
            )}

            {room.language && (
              <Badge
                variant="outline"
                className="font-black tracking-widest text-[10px] uppercase py-1 px-3 border-none"
              >
                {room.language}
              </Badge>
            )}

            {isHost && (
              <Button
                variant="default"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary transition-all ml-1"
                asChild
              >
                <Link href={`/arena/select?roomId=${roomId}`}>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden md:block">Change</span>
                </Link>
              </Button>
            )}
          </Card>

          <Card className="flex items-center justify-between gap-6 px-6 py-3 h-16 min-w-[280px]">
            <div className="flex flex-col items-start gap-1 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-tight">
                Invite Code
              </span>
              <div className="text-xl font-bold tracking-[0.2em] text-primary leading-none uppercase truncate">
                {roomId}
              </div>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={copyInviteCode}
            >
              {copied ? (
                <Check className="w-3 h-3 text-primary animate-in zoom-in duration-300" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </Card>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-7xl">
        <div className="flex items-center justify-between px-1 w-full">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40">
              Participants
            </h3>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-bold border-border/10 bg-muted/10"
            >
              {players.length} / 50
            </Badge>
          </div>
        </div>

        <div className="w-full flex justify-center py-1">
          <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-[0.15em] text-center px-6 max-w-md line-clamp-1">
            {isHost
              ? canStartMatch
                ? "You can start the match"
                : "Waiting for players..."
              : "Waiting for host to start..."}
          </p>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {players.map((player) => (
              <ArenaPlayerCard 
                key={player.userId} 
                player={player} 
                isHost={isHost}
                canKick={isHost && !player.isCreator}
                onKick={kickPlayer}
              />
            ))}
            {players.length < 50 && (
              <div className="flex items-center justify-center p-3 border border-dashed border-border/80 rounded-xl bg-muted/35 min-h-[50px] group hover:border-primary/20 transition-colors">
                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest group-hover:text-primary/30">
                  {50 - players.length} more players can join
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
