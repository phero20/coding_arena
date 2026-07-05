"use client";

import { useMemo, useState } from "react";
import { TrackConfigResponse } from "@/types/academy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, ListTree, X, BookOpen } from "lucide-react";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { useCurriculumLayout } from "./use-curriculum-layout";
import { TimelineView } from "./timeline-view";
import { GraphView } from "./graph-view";
import { ConceptView } from "./concept-view";
import { Badge } from "@/components/ui/badge";

export function SlugLearnTab({ config, solvedExercises = [] }: { config: TrackConfigResponse, solvedExercises?: string[] }) {
  const { levels, edges, showGraph } = useCurriculumLayout(config);
  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [activeConcepts, setActiveConcepts] = useState<{ slug: string; name: string }[]>([]);

  const conceptProgressMap = useMemo(() => {
    const map: Record<string, { status: "COMPLETED" | "IN_PROGRESS" | "LOCKED", progress: number, total: number }> = {};
    if (!config.concepts) return map;

    config.concepts.forEach(concept => {
      const requiredExercises = config.exercises?.concept?.filter(ex => ex.concepts?.includes(concept.slug)) || [];
      const total = requiredExercises.length;
      let solvedCount = 0;
      
      requiredExercises.forEach(ex => {
        if (solvedExercises.includes(ex.slug)) {
          solvedCount++;
        }
      });

      let status: "COMPLETED" | "IN_PROGRESS" | "LOCKED" = "LOCKED";
      if (total > 0 && solvedCount === total) {
        status = "COMPLETED";
      } else if (solvedCount > 0) {
        status = "IN_PROGRESS";
      }

      map[concept.slug] = { status, progress: solvedCount, total };
    });

    return map;
  }, [config.concepts, config.exercises?.concept, solvedExercises]);

  const handleConceptClick = (slug: string, name: string) => {
    setActiveConcepts((prev) => {
      if (!prev.find((c) => c.slug === slug)) {
        return [...prev, { slug, name }];
      }
      return prev;
    });
    setActiveTab(slug);
  };

  const handleCloseConcept = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation(); // Prevent tab from activating when clicking close
    setActiveConcepts((prev) => {
      const filtered = prev.filter((c) => c.slug !== slug);
      // If we are closing the active tab, switch back to timeline or the last open tab
      if (activeTab === slug) {
        if (filtered.length > 0) {
          setActiveTab(filtered[filtered.length - 1].slug);
        } else {
          setActiveTab("timeline");
        }
      }
      return filtered;
    });
  };

  return (
    <QueryGuard
      loading={false}
      error={null}
      data={levels}
      emptyIcon={BookOpen}
      emptyTitle="Concept Graph Coming Soon..."
      emptyMessage="We’re still mapping the learning path for this track."
    >
      <div className="w-full max-w-7xl mx-auto min-h-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        
        {/* Center Area: Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Your journey through <span className="text-primary">{config.language}</span></h2>
          <p className="text-muted-foreground mt-2 text-lg">Learn and master concepts to achieve fluency in {config.language}.</p>
        </div>

        {/* Dynamic Tabs Bar */}
        <div className="flex justify-start mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="p-2 h-12 bg-muted shadow-none inline-flex min-w-max">
            {/* Base Tabs */}
            <TabsTrigger value="timeline" className="h-9 data-[state=active]:text-primary shadow-none flex items-center gap-2">
              <ListTree className="w-4 h-4" /> Timeline
            </TabsTrigger>
            
            {showGraph && (
              <TabsTrigger value="graph" className="h-9 data-[state=active]:text-primary shadow-none flex items-center gap-2">
                <Network className="w-4 h-4" /> Graph
              </TabsTrigger>
            )}

            {/* Dynamic Concept Tabs */}
            {activeConcepts.map((concept) => (
              <TabsTrigger 
                key={concept.slug} 
                value={concept.slug} 
                className="h-9 data-[state=active]:text-primary shadow-none flex items-center gap-2 pr-2"
              >
                <BookOpen className="w-4 h-4" /> 
                <span className="capitalize">{concept.name}</span>
                <Badge 
                variant="outline"
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive text-muted-foreground transition-colors"
                  onClick={(e) => handleCloseConcept(e, concept.slug)}
                >
                  <X className="w-3.5 h-3.5" />
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content Panes */}
        <TabsContent value="timeline" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <TimelineView levels={levels} onConceptClick={handleConceptClick} conceptProgressMap={conceptProgressMap} />
        </TabsContent>
        
        {showGraph && (
          <TabsContent value="graph" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <GraphView levels={levels} edges={edges} onConceptClick={handleConceptClick} conceptProgressMap={conceptProgressMap} />
          </TabsContent>
        )}

        {/* Dynamic Concept Content Panes */}
        {activeConcepts.map((concept) => (
          <TabsContent key={`content-${concept.slug}`} value={concept.slug} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <ConceptView
              trackSlug={config.slug}
              conceptSlug={concept.slug}
              exercises={config.exercises?.concept}
            />
          </TabsContent>
        ))}
        </Tabs>
      </div>
    </QueryGuard>
  );
}


//h