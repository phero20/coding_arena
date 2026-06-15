import { ContestHero } from "@/components/contests/ContestHero";
import { ContestFilters } from "@/components/contests/ContestFilters";
import { ContestList } from "@/components/contests/ContestList";
import { getUpcomingContests } from "@/services/queries/contest.queries";
import { ContestLogo } from "@/components/contests/ContestLogo";
import { ErrorDisplay } from "@/components/shared/StatusState";

export default async function ContestHubPage() {
  let contests = [];

  try {
    contests = await getUpcomingContests(200);
  } catch (error) {
    return (
      <div className="pt-28">
        <ErrorDisplay 
          title="Failed to Load Contests" 
          message="We couldn't retrieve the global competitions from the server. Please try again later."
        />
      </div>
    );
  }

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
          <div className="mx-auto max-w-7xl px-4 2xl:px-0 pb-10">
             <ContestHero featuredContest={featuredContest} />
          </div>
        </div>

        <div className="flex flex-col space-y-6 mx-auto max-w-7xl px-4 2xl:px-0 pt-10">
          <ContestFilters />
          <ContestList contests={contests} />
        </div>
      </main>
    </div>
  );
}
