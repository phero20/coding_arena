"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer } from "lucide-react";
import { ReactFlowProvider } from "reactflow";
import { useRoadmapData } from "@/hooks/practice/use-roadmap-data";
import RoadmapCanvas from "@/components/roadmap/RoadmapCanvas";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { RoadmapSkeleton } from "@/components/skeletons/RoadmapSkeleton";
import { AlertModal } from "@/components/shared/alert-modal";

const RoadmapPage = () => {
  const { data: tree, isLoading, error } = useRoadmapData();
  const [showMaintenance, setShowMaintenance] = useState(true);
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      <AlertModal
        isOpen={showMaintenance}
        onClose={() => router.push("/")}
        title="Roadmap Under Repair"
        description="The interactive learning roadmap is currently undergoing scheduled maintenance and upgrades. Please check back later!"
        primaryActionLabel="Return Home"
        primaryAction={() => router.push("/")}
        hideCancel={true}
      />

      {/* Main Roadmap Area */}
      <main className="flex-1 relative min-h-0 w-full overflow-hidden blur-xs pointer-events-none">
        <QueryGuard
          loading={isLoading}
          error={error}
          data={tree}
          skeleton={<RoadmapSkeleton />}
          errorTitle="System Malfunction"
          errorMessage="The tactical link to the roadmap has been compromised. Verify your uplink and try again."
          onRetry={() => window.location.reload()}
        >
          {(data) => (
            <ReactFlowProvider>
              <div className="w-full h-full pt-12 ">
                <RoadmapCanvas data={data || []} />
              </div>
            </ReactFlowProvider>
          )}
        </QueryGuard>
      </main>
    </div>
  );
};

export default RoadmapPage;
