"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useArenaStore } from "@/store/useArenaStore";
import { 
  ArenaPlayerResult, 
  ArenaPlayer 
} from "@/types/arena";
import { useArenaRoomQuery, useMatchResultsQuery } from "@/hooks/queries/use-arena.queries";
import { useShallow } from "zustand/react/shallow";

interface UseMatchResultsProps {
  roomId: string;
  userId: string | null | undefined;
}

export function useMatchResults({ roomId, userId }: UseMatchResultsProps) {
  const router = useRouter();

  // 1. Store State
  const {
    room: storeRoom,
    finalRankings: stateRankings,
    matchEnded,
    matchId: storeMatchId,
    setRoom,
    resetStore,
    socket,
    setIsConnected,
    setSocket,
  } = useArenaStore(
    useShallow((state: any) => ({
      room: state.room,
      finalRankings: state.finalRankings,
      matchEnded: state.matchEnded,
      matchId: state.matchId,
      setRoom: state.setRoom,
      resetStore: state.reset,
      socket: state.socket,
      setIsConnected: state.setIsConnected,
      setSocket: state.setSocket,
    })),
  );

  // 2. Force close WebSocket on mount to prevent lag
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket, setSocket, setIsConnected]);

  const matchId = storeRoom?.matchId || storeMatchId;

  // 3. TanStack Query
  const { data: roomMetadata, isLoading: isRoomLoading } = useArenaRoomQuery(roomId);
  const { data: serverResults, isLoading: isResultsLoading } = useMatchResultsQuery(matchId);
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();

  // Invalidate stats and history when results are finalized
  useEffect(() => {
    if (serverResults && currentUser?.username) {
      queryClient.invalidateQueries({
        queryKey: ["stats", "profile", currentUser.username],
      });
      queryClient.invalidateQueries({
        queryKey: ["arena-history", currentUser.id],
      });
    }
  }, [serverResults, currentUser?.username, currentUser?.id, queryClient]);

  // Sync metadata if missing
  useEffect(() => {
    if (roomMetadata && !storeRoom) {
      setRoom(roomMetadata);
    }
  }, [roomMetadata, storeRoom, setRoom]);

  // 4. Rankings Calculation
  const getRankings = (): ArenaPlayerResult[] => {
    if (serverResults?.players && serverResults.players.length > 0) {
      return [...serverResults.players].sort((a, b) => (a.finalRank || 0) - (b.finalRank || 0));
    }

    if (stateRankings && stateRankings.length > 0) return stateRankings;

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
          verdict: pMod.verdict || (p.status === "SUBMITTED" ? "ACCEPTED" : "FAILED"),
          submittedAt: pMod.submittedAt,
          submissionOrder: pMod.submissionOrder || 0,
          finalRank: 0,
        } as ArenaPlayerResult;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.submittedAt && b.submittedAt) {
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        }
        return 0;
      })
      .map((p, index) => ({ ...p, finalRank: index + 1 }));
  };

  const rankings = getRankings();

  // 5. Host Check
  const currentRoom = storeRoom || roomMetadata;
  const isHost = (currentRoom?.players && userId) ? (currentRoom.players[userId]?.isCreator || false) : false;

  // 6. Actions
  const handleLeave = () => {
    resetStore();
    router.push("/arena");
  };

  const handleReset = () => {
    router.push(`/arena/match/${roomId}`);
  };

  return {
    rankings,
    isHost,
    isLoading: (isRoomLoading || isResultsLoading || (matchEnded && rankings.length === 0)) && !rankings.length,
    handleLeave,
    handleReset,
    room: storeRoom || roomMetadata,
  };
}
