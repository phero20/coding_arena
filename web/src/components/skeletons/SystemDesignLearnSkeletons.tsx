import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

export function LearnSidebarSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="space-y-6 w-full">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} height={36} width="100%" className="rounded-md opacity-60 mb-1" />
        ))}
      </div>
    </SkeletonProvider>
  );
}

export function LearnContentSkeleton() {
  return (
    <SkeletonProvider noWrapper>
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 mt-8">
        {/* Title Header */}
        <div>
          <Skeleton height={40} width="70%" className="mb-4 rounded-md" />
          <Skeleton height={24} width="100%" className="opacity-60 rounded-sm mb-1.5" />
          <Skeleton height={24} width="85%" className="opacity-60 rounded-sm" />
        </div>

        {/* Paragraph Block */}
        <div>
          <Skeleton count={4} height={18} className="mb-2.5 rounded-sm opacity-40" />
          <Skeleton height={18} width="60%" className="rounded-sm opacity-40" />
        </div>

        {/* Subheading & Paragraph */}
        <div>
          <Skeleton height={32} width="40%" className="mb-5 rounded-md opacity-70" />
          <Skeleton count={3} height={18} className="mb-2.5 rounded-sm opacity-40" />
          <Skeleton height={18} width="80%" className="rounded-sm opacity-40" />
        </div>

        {/* Code Block or Image Placeholder */}
        <div className="border border-border/40 bg-card/10 rounded-xl p-6 h-64 flex items-center justify-center">
           <Skeleton height={208} width="100%" className="opacity-20 rounded-lg" />
        </div>
        
        {/* Paragraph Block */}
        <div>
          <Skeleton count={2} height={18} className="mb-2.5 rounded-sm opacity-40" />
          <Skeleton height={18} width="70%" className="rounded-sm opacity-40" />
        </div>
      </div>
    </SkeletonProvider>
  );
}
