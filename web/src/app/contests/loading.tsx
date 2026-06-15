import { ContestHeroSkeleton, ContestListSkeleton } from "@/components/skeletons";
import { ContestLogo } from "@/components/contests/ContestLogo";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { SkeletonProvider } from "@/components/skeletons/BaseSkeleton";

export default function Loading() {
  return (
    <div className="relative bg-background text-foreground">
      <ScrollToTop />
      
      <main className="py-28">
        <div className="border-b">
          <div className="mb-10 flex flex-col gap-2 border-b pb-4 mx-auto max-w-7xl px-4 2xl:px-0">
            <div className="flex items-center gap-1">
              <ContestLogo className="w-10 h-10 md:w-14 md:h-14 shrink-0" />
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Global Competitions</h1>
            </div>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              Track, filter, and join competitive programming contests from top platforms worldwide.
            </p>
          </div>
          <div className="mx-auto max-w-7xl px-4 2xl:px-0 pb-10">
            <ContestHeroSkeleton />
          </div>
        </div>

        <div className="flex flex-col space-y-6 mx-auto max-w-7xl px-4 2xl:px-0 pt-10">
          {/* Skeleton for Filters */}
          <SkeletonProvider noWrapper>
             <div className="h-12 w-full max-w-2xl bg-muted/20 animate-pulse rounded-md" />
          </SkeletonProvider>
          
          <ContestListSkeleton />
        </div>
      </main>
    </div>
  );
}
