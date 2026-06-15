import { RoadmapSkeleton } from "@/components/skeletons/RoadmapSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      <main className="flex-1 relative min-h-0 w-full overflow-hidden">
        <RoadmapSkeleton />
      </main>
    </div>
  );
}
