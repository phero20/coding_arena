import { AcademyTracksSkeleton } from "@/components/skeletons/AcademySkeletons";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "@/components/skeletons/BaseSkeleton";

export default function TracksSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      {/* Simple Full Width Header Skeleton */}
      <div className="w-full border-b border-border/40 pt-24 pb-8 lg:pt-28 lg:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Skeleton height={100} className="w-full rounded-2xl opacity-40" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton height={40} width={300} className="rounded-md opacity-40" />
            <Skeleton height={40} width={150} className="rounded-md opacity-40" />
          </div>
          
          {/* Grid Skeleton */}
          <AcademyTracksSkeleton />
        </div>
      </div>
    </SkeletonProvider>
  );
}
