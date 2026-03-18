"use client";

import React, { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MatchWorkspace } from "@/components/arena/match-editor/MatchWorkspace";
import { useProblem } from "@/hooks/use-problem";
import { useArenaRoom } from "@/hooks/use-arena-room";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
        typeof error === "string" ? error : (error as any)?.message || "Match Error";
      
      const isTermination = errorStr.toLowerCase().includes("terminated");
      
      toast.error(isTermination ? "Match Aborted" : "Arena Error", {
        description: isTermination ? "The host has ended the session." : errorStr,
      });

      router.push("/arena");
    }
  }, [error, router]);

  if (isLoading || !problem) {
    return (
      <div className="h-screen w-full bg-background flex flex-col p-4 space-y-4">
        <div className="flex gap-4 h-12">
          <Skeleton className="h-full w-48 bg-muted/20" />
          <Skeleton className="h-full w-32 bg-muted/20" />
        </div>
        <div className="flex-1 flex gap-4">
          <Skeleton className="h-full flex-1 bg-muted/10" />
          <Skeleton className="h-full flex-[1.5] bg-muted/5" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <MatchWorkspace
        problem={problem}
        roomId={roomId}
        sendMessage={sendMessage}
        onExit={leaveRoom}
        enforcedLanguage={room?.language}
      />
    </main>
  );
};

export default MatchDetailPage;
