"use client";

import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MatchWorkspace } from "@/components/arena/match-editor/MatchWorkspace";
import { useProblemQuery } from "@/hooks/queries/use-problem.queries";
import { useArenaRoom } from "@/hooks/arena/use-arena-room";
import { useArenaTransitions } from "@/hooks/arena/use-arena-actions";
import { WorkspaceSkeleton } from "@/components/shared/Skeletons";

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
  } = useArenaRoom(roomId);

  const problemIdentifier = room?.problemSlug || room?.problemId;
  const {
    data: problem,
    isLoading: isLoadingProblem,
    error: problemError,
  } = useProblemQuery(room?.problemSlug || "");

  const isLoading = isLoadingRoom || (!!room && isLoadingProblem);
  const error = roomError || (!!room && problemError);

  // 1. Centralized Transitions (Auto-redirect to results when status === "FINISHED")
  useArenaTransitions(roomId, room?.status);

  // 2. Handle Errors
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

  if (isLoading || !problem || !room) {
    return <WorkspaceSkeleton />;
  }

  return (
    <main className="min-h-screen bg-background relative">
      <MatchWorkspace
        key={`${roomId}-${room?.status}-${room?.language}`}
        problem={problem}
        roomId={roomId}
      />
    </main>
  );
};

export default MatchDetailPage;
