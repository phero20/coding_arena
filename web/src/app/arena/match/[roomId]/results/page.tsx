"use client";

import React, { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useArenaStore } from "@/store/useArenaStore";
import {
  ArenaPlayerResult,
  ArenaRoom,
  ArenaPlayer,
} from "@/services/arena.service";
import { MatchResults } from "@/components/arena/MatchResults";
import { WorkspaceSkeleton } from "@/components/shared/Skeletons";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useShallow } from "zustand/react/shallow";

import { useArenaRoomQuery, useMatchResultsQuery } from "@/hooks/api/use-arena-api";

interface ArenaResultsPageProps {
  params: Promise<{ roomId: string }>;
}

const ArenaResultsPage = ({ params }: ArenaResultsPageProps) => {
  const { roomId } = use(params);
  const router = useRouter();
  const { userId } = useAuth();

  const {
    room: storeRoom,
    socket,
    finalRankings: stateRankings,
    matchEnded,
    matchId: storeMatchId,
    setRoom,
  } = useArenaStore(
    useShallow((state: any) => ({
      room: state.room as ArenaRoom | null,
      socket: state.socket as WebSocket | null,
      finalRankings: state.finalRankings as ArenaPlayerResult[],
      matchEnded: state.matchEnded as boolean,
      matchId: state.matchId as string | null,
      setRoom: state.setRoom,
    })),
  );

  const matchId = storeRoom?.matchId || storeMatchId;

  // 1. TanStack Query for metadata and results
  const { data: roomMetadata, isLoading: isRoomLoading } = useArenaRoomQuery(roomId);
  const { data: serverResults, isLoading: isResultsLoading } = useMatchResultsQuery(matchId);

  // Sync metadata if missing
  useEffect(() => {
    if (roomMetadata && !storeRoom) {
      setRoom(roomMetadata);
    }
  }, [roomMetadata, storeRoom, setRoom]);

  // 2. Force close WebSocket on mount to prevent lag
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("[Results] Closing socket to prevent lag");
      socket.close();
      useArenaStore.getState().setSocket(null);
      useArenaStore.getState().setIsConnected(false);
    }
  }, [socket]);

  // 3. Resilient Rankings calculation
  const rankings: ArenaPlayerResult[] = useMemo(() => {
    // Priority 1: Permanent server results from MongoDB
    if (serverResults?.players && serverResults.players.length > 0) {
      return [...serverResults.players].sort((a, b) => (a.finalRank || 0) - (b.finalRank || 0));
    }

    // Priority 2: Real-time rankings from store (WS sync)
    if (stateRankings && stateRankings.length > 0) return stateRankings;

    // Fallback: Derived from live player state
    const currentRoom = storeRoom || roomMetadata;
    if (!currentRoom?.players) return [];

    return Object.values(currentRoom.players as Record<string, ArenaPlayer>)
      .map((p: ArenaPlayer) => {
        const pMod = p as any;
        return {
          userId: p.userId,
          username: p.username,
          avatarUrl: p.avatarUrl,
          score: p.score || 0,
          testsPassed: p.testsPassed || 0,
          totalTests: p.totalTests || 0,
          verdict:
            pMod.verdict || (p.status === "SUBMITTED" ? "ACCEPTED" : "FAILED"),
          submittedAt: pMod.submittedAt,
          submissionOrder: pMod.submissionOrder || 0,
          finalRank: 0,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.submittedAt && b.submittedAt) {
          return (
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime()
          );
        }
        return 0;
      })
      .map((p, index) => ({ ...p, finalRank: index + 1 }));
  }, [storeRoom, roomMetadata, stateRankings, serverResults]);

  const isHost = useMemo(() => {
    const currentRoom = storeRoom || roomMetadata;
    if (!currentRoom?.players || !userId) return false;
    const player = currentRoom.players[userId];
    return player?.isCreator || false;
  }, [storeRoom, roomMetadata, userId]);

  const handleLeave = () => {
    useArenaStore.getState().reset();
    router.push("/arena");
  };

  const handleReset = () => {
    // Return to match page (lobby)
    router.push(`/arena/match/${roomId}`);
  };

  // 4. Improved Loading & Crash guards
  const isLoading = isRoomLoading || isResultsLoading || (matchEnded && rankings.length === 0);

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (rankings.length === 0 && !storeRoom && !roomMetadata) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-destructive">
          Results Not Available
        </h1>
        <p className="text-muted-foreground mb-6 text-center max-w-xs">
          The match data could not be retrieved. It may have been expired or
          deleted.
        </p>
        <button
          onClick={() => router.push("/arena")}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 flex flex-col items-center justify-center">
      <MatchResults rankings={rankings} isHost={isHost} onClose={handleLeave} />
    </main>
  );
};

export default ArenaResultsPage;
