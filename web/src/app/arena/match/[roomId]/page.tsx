"use client";

import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MatchWorkspace } from "@/components/arena/match-editor/MatchWorkspace";
import { useProblem } from "@/hooks/api/use-problem";
import { useArenaRoom } from "@/hooks/arena/use-arena-room";
import { WorkspaceSkeleton } from "@/components/shared/Skeletons";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MatchOverOverlay } from "@/components/arena/MatchOverOverlay";

interface ArenaMatchPageProps {
  params: Promise<{ roomId: string }>;
}

const MatchDetailPage = ({ params }: ArenaMatchPageProps) => {
  const { roomId } = use(params);
  const router = useRouter();
  const {
    room,
    isLoading: isLoadingRoom,
    error: roomError,
    sendMessage,
    leaveRoom,
  } = useArenaRoom(roomId);
  const problemIdentifier = room?.problemSlug || room?.problemId;
  const {
    problem,
    isLoading: isLoadingProblem,
    error: problemError,
  } = useProblem(problemIdentifier);

  const isLoading = isLoadingRoom || (!!room && isLoadingProblem);
  const error = roomError || (!!room && problemError);
  useEffect(() => {
    if (error) {
      const errorStr =
        typeof error === "string"
          ? error
          : (error as any)?.message || "Match Error";

      const isTermination = errorStr.toLowerCase().includes("terminated");

      toast.error(isTermination ? "Match Aborted" : "Arena Error", {
        description: isTermination
          ? "The host has ended the session."
          : errorStr,
      });

      router.push("/arena");
    }
  }, [error, router]);
  const isMatchFinished = room?.status === "FINISHED";
  const playersCount = room?.players ? Object.keys(room.players).length : 0;

  if (isLoading || !problem) {
    return <WorkspaceSkeleton />;
  }

  return (
    <main className="min-h-screen bg-background relative">
      <MatchWorkspace problem={problem} roomId={roomId} />

      <MatchOverOverlay
        isOpen={isMatchFinished}
        roomId={roomId}
        playersCount={playersCount}
      />
    </main>
  );
};

export default MatchDetailPage;
