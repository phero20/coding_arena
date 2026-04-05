"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useArenaRoom } from "@/hooks/arena/use-arena-room";
import { ArenaLobby } from "@/components/arena/ArenaLobby";
import { LobbySkeleton } from "@/components/shared/Skeletons";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { ConnectionBadge } from "@/components/shared/StatusState";
import { useRouter } from "next/navigation";

import { useArenaStore } from "@/store/useArenaStore";

import { useAuth } from "@clerk/nextjs";

interface ArenaRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function ArenaRoomPage({ params }: ArenaRoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const { userId } = useAuth();

  // Retry state for room synchronization
  const [retries, setRetries] = useState(0);
  const maxRetries = 3;

  const {
    room,
    isConnected,
    error,
    isLoading: isRoomLoading,
    startMatch,
    leaveRoom,
    isStartingMatch,
  } = useArenaRoom(roomId);

  const {
    matchEnded,
    finalRankings,
  } = useArenaStore(
    useShallow((state: any) => ({
      matchEnded: state.matchEnded,
      finalRankings: state.finalRankings,
    }))
  );

  // 1. Handle Errors & Navigation
  useEffect(() => {
    if (error) {
      toast.error("Arena Error", { description: error });
      router.push("/arena");
    }
  }, [error, router]);

  // 2. Redirect to match if already playing
  useEffect(() => {
    if (room?.status === "PLAYING" && room?.roomId === roomId && !matchEnded) {
      router.push(`/arena/match/${roomId}`);
    }
  }, [room?.status, room?.roomId, roomId, router, matchEnded]);

  // 3. Redirect to results if match ended
  useEffect(() => {
    if (matchEnded && finalRankings.length > 0) {
      router.push(`/arena/match/${roomId}/results`);
    }
  }, [matchEnded, finalRankings.length, roomId, router]);

  const isLoading = isRoomLoading || (matchEnded && !finalRankings.length);

  if (isLoading || (!room && !matchEnded)) {
    return <LobbySkeleton />;
  }

  // 6. Lobby View
  if (room) {
    return (
      <div className="min-h-screen bg-background relative flex flex-col">
        <ConnectionBadge isConnected={isConnected} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full h-full flex flex-col justify-center">
          <ArenaLobby
            roomId={roomId}
            room={room}
            startMatch={startMatch}
            leaveRoom={leaveRoom}
            isConnected={isConnected}
            isStartingMatch={isStartingMatch}
          />
        </div>
      </div>
    );
  }

  return null;
}
