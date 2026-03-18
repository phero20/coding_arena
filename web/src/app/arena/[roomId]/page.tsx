"use client";

import { use, useEffect } from "react";
import { useArenaRoom } from "@/hooks/use-arena-room";
import { ArenaLobby } from "@/components/arena/ArenaLobby";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ArenaRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function ArenaRoomPage({ params }: ArenaRoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const {
    room,
    isConnected,
    error,
    isLoading,
    setReady,
    startMatch,
    leaveRoom,
  } = useArenaRoom(roomId);

  // 2. Handle Errors
  useEffect(() => {
    if (error) {
      const errorStr =
        typeof error === "string"
          ? error
          : (error as any)?.message || "Arena Error";

      toast.error("Arena Error", {
        description: errorStr,
      });

      router.push("/arena");
    }
  }, [error, router]);

  // This hook is GONE, which is why the "Start" button does nothing (it changes status on server, but client doesn't move)
  useEffect(() => {
    if (room?.status === "PLAYING") {
      router.push(`/arena/match/${roomId}`);
    }
  }, [room?.status, roomId, router]);

  // 3. Loading State
  if (isLoading || !room) {
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

  // 4. Lobby View
  if (room) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center">
        <div className="relative z-10 max-w-6xl mx-auto px-4 space-y-4">
          {/* Connection Status Indicator */}
          {!isConnected && (
            <div className="flex justify-center -mb-4 animate-in fade-in slide-in-from-top-4">
              <Badge
                variant="outline"
                className="px-4 py-1 gap-2 rounded-full backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                Reconnecting to Arena...
              </Badge>
            </div>
          )}

          <ArenaLobby
            roomId={roomId}
            room={room}
            setReady={setReady}
            startMatch={startMatch}
            leaveRoom={leaveRoom}
            isConnected={isConnected}
          />
        </div>
      </div>
    );
  }

  return null;
}
