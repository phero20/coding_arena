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

import { useArenaTransitions } from "@/hooks/arena/use-arena-actions";

export default function ArenaRoomPage({ params }: ArenaRoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();

  // 1. [SELF-SERVING] The page only needs minimal metadata for transitions/errors
  const {
    room,
    isConnected,
    error,
    isLoading: isRoomLoading,
  } = useArenaRoom(roomId);

  const { matchEnded } = useArenaStore(
    useShallow((state: any) => ({
      matchEnded: state.matchEnded,
    })),
  );

  // 2. Centralized Transitions
  useArenaTransitions(roomId, room?.status, matchEnded);

  // 3. Handle Errors
  useEffect(() => {
    if (error) {
      toast.error("Arena Error", { description: error });
      router.push("/arena");
    }
  }, [error, router]);

  if (isRoomLoading || (!room && !matchEnded)) {
    return <LobbySkeleton />;
  }

  // 4. Lobby View
  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <ConnectionBadge isConnected={isConnected} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 w-full h-full flex flex-col justify-center">
        <ArenaLobby roomId={roomId} />
      </div>
    </div>
  );
}
