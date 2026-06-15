import { WorkspaceSkeleton } from "@/components/skeletons/WorkspaceSkeletons";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollToTop />
      <WorkspaceSkeleton />
    </main>
  );
}
