import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";

/**
 * Roadmap Tree Skeleton
 * Follows the 8-level learning path standard with a clean, industrial look.
 */
export const RoadmapSkeleton = () => {
  type ItemType = "node" | "spacer";
  
  const levels: { items: ItemType[] }[] = [
    { items: ["node"] }, // Level 1: Arrays
    { items: ["node", "spacer", "node"] }, // Level 2: Strings, Hash map
    { items: ["node", "node", "node"] }, // Level 3: Sorting, Linked Lists, Stacks
    { items: ["node"] }, // Level 4: Queue / Deque
    { items: ["node", "spacer", "spacer", "node"] }, // Level 5: Recursion, Trees
    { items: ["node", "node", "node", "node", "node"] }, // Level 6: Bit Manipulation, DP, Trie, Heap, Graphs
    { items: ["spacer", "spacer", "spacer", "node", "node"] }, // Level 7: Greedy, Range Structures
    { items: ["node"] }, // Level 8: Math & Geometry
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
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {level.items.map((item, nIdx) => (
                  <div
                    key={nIdx}
                    className={`p-1 border border-border/40 rounded bg-card/10 flex items-center gap-1.5 min-w-[60px] md:min-w-[120px] py-2 ${
                      item === "spacer" ? "invisible pointer-events-none" : ""
                    }`}
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
