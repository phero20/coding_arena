"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { MatchResults } from "@/components/arena/MatchResults";
import { WorkspaceSkeleton } from "@/components/shared/Skeletons";
import { useMatchResults } from "@/hooks/arena/use-match-results";

interface ArenaResultsPageProps {
  params: Promise<{ roomId: string }>;
}

const ArenaResultsPage = ({ params }: ArenaResultsPageProps) => {
  const { roomId } = use(params);
  const router = useRouter();
  const { userId } = useAuth();

  const {
    rankings,
    isHost,
    isLoading,
    handleLeave,
    room,
  } = useMatchResults({ roomId, userId });

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (rankings.length === 0 && !room) {
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
    <main className="bg-background px-4">
      <MatchResults rankings={rankings} isHost={isHost} onClose={handleLeave} />
    </main>
  );
};

export default ArenaResultsPage;
