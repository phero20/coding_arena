"use client";

import React from "react";
import { ReactFlowProvider } from "reactflow";
import { useTaxonomyTreeQuery } from "@/hooks/queries/use-taxonomy.queries";
import RoadmapCanvas from "@/components/roadmap/RoadmapCanvas";
import { Skeleton } from "@/components/ui/skeleton";
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
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center p-20 gap-16">
            <div className="space-y-6 flex-1 max-w-md">
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3 rounded-xl" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
              <div className="pt-10 space-y-4">
                <Skeleton className="h-4 w-full opacity-50" />
                <Skeleton className="h-4 w-4/5 opacity-30" />
                <Skeleton className="h-4 w-3/4 opacity-10" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-6 opacity-40">
              <Skeleton className="h-40 w-full rounded-[2rem]" />
              <Skeleton className="h-40 w-full rounded-[2rem]" />
              <Skeleton className="h-40 w-full rounded-[2rem]" />
              <Skeleton className="h-40 w-full rounded-[2rem]" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full flex-col space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
              <div className="relative p-8 bg-destructive/10 rounded-[2.5rem] border-2 border-destructive/20">
                <Zap className="w-16 h-16 text-destructive" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-3xl font-black uppercase italic tracking-tighter">System Malfunction</p>
              <p className="text-muted-foreground font-medium max-w-sm">The tactical link to the roadmap has been compromised. Verify your uplink and try again.</p>
            </div>
            <Button 
              size="lg" 
              className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-destructive/20 hover:scale-105 transition-transform"
              onClick={() => window.location.reload()}
            >
              Re-establish Uplink
            </Button>
          </div>
        ) : (
          <ReactFlowProvider>
            <div className="absolute inset-0">
              <RoadmapCanvas data={tree || []} />
            </div>
          </ReactFlowProvider>
        )}
      </main>

    </div>
  );
};

export default RoadmapPage;
