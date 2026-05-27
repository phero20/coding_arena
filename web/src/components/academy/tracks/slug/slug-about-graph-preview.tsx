"use client";

import React from "react";
import { TrackConfigResponse } from "@/types/academy";
import { useCurriculumLayout } from "@/components/academy/tracks/learn/use-curriculum-layout";
import { GraphView } from "@/components/academy/tracks/learn/graph-view";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export const SlugAboutGraphPreview = ({ config }: { config: TrackConfigResponse }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { levels, edges, showGraph } = useCurriculumLayout(config);

  if (!showGraph || !levels || levels.length === 0) return null;

  const goToLearnTab = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "learn");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto my-16 px-4 border-t-2 border-border/50 pt-20 pb-10">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          A taste of <span className="text-primary">{config.language}</span> concepts you'll cover
        </h2>
      </div>

      {/* Graph Container */}
      <div className="relative h-155 overflow-hidden flex justify-center mb-8">
        
        {/* Render the actual graph */}
        <div className="absolute top-0 w-full opacity-80 pointer-events-none">
          <GraphView levels={levels} edges={edges} />
        </div>

        {/* Gradient Overlay to fade the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-76 bg-linear-to-t from-background via-background/60 to-background/10 z-20 pointer-events-none" />
      </div>

      {/* Simple CTA Content - Totally Outside */}
      <div className="flex flex-col items-center justify-center pb-10 px-4">
        <Button 
          variant="link" 
          className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
          onClick={goToLearnTab}
        >
          See all the concepts for {config.language} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
