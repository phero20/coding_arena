"use client";

import { use } from "react";
import { useArenaRoom } from "@/hooks/use-arena-room";
import { ArenaLobby } from "@/components/arena/ArenaLobby";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ArenaRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function ArenaRoomPage({ params }: ArenaRoomPageProps) {
  const { roomId } = use(params);
  const { 
    room, 
    isConnected, 
    error, 
    isLoading, 
    setReady, 
    startMatch, 
    leaveRoom 
  } = useArenaRoom(roomId);

  // 1. Loading State
  if (isLoading && !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-16 w-56 bg-secondary/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Skeleton className="h-36 rounded-3xl bg-secondary/10" />
          <Skeleton className="h-36 rounded-3xl bg-secondary/10" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 backdrop-blur-xl">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Arena Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button asChild variant="outline" className="px-8">
              <Link href="/arena">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Arena
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Main View
  if (room) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center">
        <div className="relative z-10 max-w-6xl mx-auto px-4 space-y-4">
          {/* Connection Status Indicator */}
          {!isConnected && (
            <div className="flex justify-center -mb-4 animate-in fade-in slide-in-from-top-4">
              <Badge variant="outline" className="px-4 py-1 gap-2 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Reconnecting to Arena...
              </Badge>
            </div>
          )}

          {room.status === "WAITING" || room.status === "LOBBY" ? (
             <ArenaLobby
              roomId={roomId}
              room={room}
              setReady={setReady}
              startMatch={startMatch}
              leaveRoom={leaveRoom}
              isConnected={isConnected}
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Battle in Progress
                </h2>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-70">
                  Neural link established. Syncing battle grid...
                </p>
              </div>

              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 py-1.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-colors"
              >
                {room.status === "PLAYING" ? "Combat Mode Active" : room.status}
              </Badge>

              <div className="pt-12 text-[9px] uppercase font-bold tracking-[0.4em] text-muted-foreground/30">
                Arena phase 2 initialization pending...
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 uppercase tracking-[0.2em] text-[10px] font-bold mt-12 transition-all opacity-50 hover:opacity-100"
                onClick={leaveRoom}
              >
                Terminate Link & Surrender
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
