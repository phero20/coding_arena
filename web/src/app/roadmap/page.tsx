"use client";

import React from "react";
import { ReactFlowProvider } from "reactflow";
import { useTaxonomyTreeQuery } from "@/hooks/queries/use-taxonomy.queries";
import RoadmapCanvas from "@/components/roadmap/RoadmapCanvas";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { RoadmapSkeleton } from "@/components/skeletons/RoadmapSkeleton";
import { 
  Network, 
  Search, 
  Filter, 
  MoreHorizontal,
  Info,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RoadmapPage = () => {
  const { data: tree, isLoading, error } = useTaxonomyTreeQuery();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">


      {/* Main Roadmap Area */}
      <main className="flex-1 relative">
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
              <div className="absolute inset-0">
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
