import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Roadmap Sidebar Skeleton
 * Mirrors the table layout in the roadmap detail sidebar
 */
export const RoadmapSidebarSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-8 pb-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton width={32} height={32} className="rounded-md" />
          <Skeleton width={240} height={24} className="rounded-sm" />
        </div>
        <Skeleton count={2} height={12} className="rounded-sm opacity-20" />
        <Skeleton
          width={120}
          height={20}
          className="rounded-md opacity-20 mt-4"
        />
      </div>
      <div className="flex-1 mt-6">
        <div className="h-10 border-b flex items-center px-8 justify-between">
          <Skeleton width={30} height={10} />
          <Skeleton width={150} height={10} />
          <Skeleton width={60} height={10} />
          <Skeleton width={60} height={10} />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-border/5 flex items-center px-8 justify-between opacity-50"
          >
            <Skeleton width={25} height={10} />
            <Skeleton width="40%" height={12} />
            <Skeleton width={65} height={18} />
            <Skeleton width={80} height={32} />
          </div>
        ))}
      </div>
    </div>
  </SkeletonProvider>
);
