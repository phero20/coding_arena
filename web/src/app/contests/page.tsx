"use client";

import { ContestHero } from "@/components/contests/ContestHero";
import { ContestHeroSkeleton } from "@/components/skeletons";
import { ContestFilters } from "@/components/contests/ContestFilters";
import { ContestList } from "@/components/contests/ContestList";
import { useUpcomingContestsQuery } from "@/hooks/queries/use-contest.queries";
import { ContestLogo } from "@/components/contests/ContestLogo";

export default function ContestHubPage() {
  const { data: contests, isLoading } = useUpcomingContestsQuery(200);
  const featuredContest = contests && contests.length > 0 ? contests[0] : null;

  return (
    <div className="relative bg-background text-foreground">
      <main className="py-28">
        <div className="border-b">
          <div className="mb-10 flex flex-col gap-2 border-b pb-4 mx-auto max-w-7xl px-4 2xl:px-0 ">
            <div className="flex items-center gap-1">
              <ContestLogo className="w-10 h-10 md:w-14 md:h-14 shrink-0" />
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Global Competitions</h1>
            </div>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              Track, filter, and join competitive programming contests from top platforms worldwide.
            </p>
          </div>
          <div className="mx-auto max-w-7xl px-4 2xl:px-0">
            {isLoading ? (
              <ContestHeroSkeleton />
            ) : (
              <ContestHero featuredContest={featuredContest} />
            )}
          </div>


        </div>

        <div className="flex flex-col space-y-6 mx-auto max-w-7xl px-4 2xl:px-0 ">
          <ContestFilters />
          <ContestList />
        </div>
      </main>
    </div>
  );
}

