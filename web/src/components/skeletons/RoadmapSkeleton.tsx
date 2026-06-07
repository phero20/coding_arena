import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Roadmap Tree Skeleton
 * Follows the 8-level learning path standard with a clean, industrial look.
 */
export const RoadmapSkeleton = () => {
  const levels = [
    { nodes: 1 }, // Level 1: Root (Array)
    { nodes: 2 }, // Level 2: First Branch
    { nodes: 3 }, // Level 3: Wide Spread
    { nodes: 1 }, // Level 4: Convergence Hub (Trees)
    { nodes: 2 }, // Level 5: Second Branch
    { nodes: 3 }, // Level 6: Specialist Paths
    { nodes: 4 }, // Level 7: Widest Row
    { nodes: 1 }, // Level 8: Final Convergence (Math)
  ];

  return (
    <SkeletonProvider noWrapper>
      <div className="absolute inset-0 bg-background flex flex-col items-center py-28 px-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div className="w-full max-w-6xl space-y-6">
          {levels.map((level, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              {/* Vertical Connector Ghost (except first level) */}
              {idx !== 0 && (
                <div className="h-2 w-px bg-border/40 border-l border-dashed border-border/40" />
              )}

              {/* Horizontal Row of Nodes */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-12 w-full">
                {Array.from({ length: level.nodes }).map((_, nIdx) => (
                  <div
                    key={nIdx}
                    className="p-1 border border-border/40 rounded bg-card/10 flex items-center gap-1.5 min-w-[60px] md:min-w-[120px] py-2"
                  >
                    <Skeleton
                      circle
                      width={10}
                      height={10}
                      className="opacity-20"
                    />
                    <Skeleton width={40} height={6} className="rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonProvider>
  );
};
