"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { MatchResults } from "@/components/arena/MatchResults";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { MatchResultsSkeleton } from "@/components/skeletons/ArenaSkeletons";
import { useMatchResults } from "@/hooks/arena/use-match-results";
import { Button } from "@/components/ui/button";
import SideRays from "@/components/home/ParticleNetwork";
import { tones } from "@/lib/tones";

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

  return (
    <main className="bg-background px-4">
      <QueryGuard
        loading={isLoading}
        error={null}
        data={room ? rankings : null}
        isEmpty={rankings.length === 0 && !room}
        skeleton={<MatchResultsSkeleton />}
        emptyTitle="Results Not Available"
        emptyMessage="The match data could not be retrieved. It may have been expired or deleted."
        emptyAction={
          <Button
            onClick={() => router.push("/arena")}
            className="px-6 py-2 font-bold mt-4"
          >
            Return to Hub
          </Button>
        }
      >
        <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden z-0">
          <SideRays
            rayColor1='#facc15'
          rayColor2 = '#60a5fa'
          speed={3}
          intensity={3.5}
          spread={5}
          origin="top-left"
          tilt={-55}
          saturation={1.5}
          blend={0.75}
          falloff={2.5}
          opacity={0.1}
          />
          <SideRays
          rayColor1='#facc15'
          rayColor2 = '#60a5fa'
          speed={3}
          intensity={3.5}
          spread={5}
          origin="top-right"
          tilt={55}
          saturation={1.5}
          blend={0.75}
          falloff={2.5}
          opacity={0.1}
          />
        </div>
        <MatchResults rankings={rankings} isHost={isHost} onClose={handleLeave} />
      </QueryGuard>
    </main>
  );
};

export default ArenaResultsPage;
