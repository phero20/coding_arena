import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArenaPlayerCard } from "./ArenaPlayerCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Share2,
  Rocket,
  Sword,
  LogOut,
  XCircle,
  Check,
  Edit2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArenaRoom } from "@/services/arena.service";

interface ArenaLobbyProps {
  roomId: string;
  room: ArenaRoom;
  setReady: (ready: boolean) => void;
  startMatch: () => void;
  leaveRoom: () => void;
  isConnected: boolean;
}

export function ArenaLobby({
  roomId,
  room,
  setReady,
  startMatch,
  leaveRoom,
  isConnected,
}: ArenaLobbyProps) {
  const { userId } = useAuth();
  const [copied, setCopied] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const players = useMemo(() => Object.values(room?.players || {}), [room?.players]);
  const currentPlayer = useMemo(() => (userId ? room?.players[userId] : null), [userId, room?.players]);

  // Logic checks
  const isHost = currentPlayer?.isCreator;
  const allReady = useMemo(() => players.length >= 2 && players.every((p) => p.isReady), [players]);
  const isReady = !!currentPlayer?.isReady;

  const copyInviteCode = useCallback(() => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);
  console.log(room)

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 md:gap-12 pt-12 pb-4 duration-500",
        hasMounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0",
      )}
    >
      {/* Arena Header */}
      <div className="w-full space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center border border-border/50">
            <Sword className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic opacity-90">
            Arena Lobby
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {/* Problem Details */}
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

            {
              room.language && (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-black tracking-widest text-[10px] uppercase py-1 px-3 border-none",
                  )}
                >
                  {room.language}
                </Badge>
              )
            }

            {isHost && (
              <Button
                variant="default"
                size="icon"
                className="h-8 w-20 px-12 hover:bg-primary/10 hover:text-primary transition-all ml-1"
                asChild
              >
                <Link href={`/arena/select?roomId=${roomId}`}>
                  <Edit2 className="w-3.5 h-3.5" />
                  Change
                </Link>
              </Button>
            )}
          </Card>

          {/* Invite Code */}
          <Card className="flex items-center justify-between gap-6 px-6 py-3 h-16 min-w-[280px]">
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 leading-tight">
                Invite Code
              </span>
              <div className="text-xl font-bold tracking-[0.2em] text-primary leading-none uppercase truncate">
                {roomId}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={copyInviteCode}
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary animate-in zoom-in duration-300" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </Card>
        </div>
      </div>
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player) => (
            <ArenaPlayerCard key={player.userId} player={player} />
          ))}
          {players.length < 2 && (
            <div className="flex items-center justify-center p-6 border border-dashed border-border/60 rounded-xl bg-muted/5 min-h-[60px]">
              <div className="text-center space-y-1">
                <p className="font-semibold text-xs text-foreground/60 uppercase tracking-tight">
                  Waiting for Opponent
                </p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                  Share the code to start a battle
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-80 text-center px-4 max-w-sm mx-auto">
          {!isReady
            ? "Waiting for you to get ready"
            : isHost
              ? allReady
                ? "Everyone is ready. You can start the match."
                : "Waiting for other players to get ready..."
              : "Waiting for host to start..."}
        </p>
      </div>

      <div className="flex flex-row items-center justify-center gap-3 w-full pt-4 border-t border-border/40">
        {!isReady ? (
          <Button
            size="lg"
            className="h-11 px-6"
            onClick={() => setReady(true)}
            disabled={!isConnected}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Ready
          </Button>
        ) : isHost ? (
          <Button
            size="lg"
            variant="default"
            className="h-11 px-6"
            onClick={startMatch}
            disabled={!allReady || !isConnected}
          >
            <Sword className="mr-2 h-4 w-4" />
            Start Match
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 border-dashed hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all group"
            onClick={() => setReady(false)}
          >
            <XCircle className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            Not Ready
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          className="h-11 px-4"
          onClick={leaveRoom}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit Arena
        </Button>
      </div>
    </div>
  );
}
