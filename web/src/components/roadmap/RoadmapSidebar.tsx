"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  LayoutGrid,
  Map
} from "lucide-react";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { useCategoryDetailQuery } from "@/hooks/queries/use-taxonomy.queries";
import { cn } from "@/lib/utils";
import Link from "next/link";

const RoadmapSidebar = () => {
  const { activeNodeId, setActiveNodeId } = useRoadmapStore();
  
  // We use the activeNodeId as the slug for the query.
  // In our taxonomy repo, findCategoryBySlug is used. 
  // We should make sure we have the slug. In our tree, the "id" we passed to React Flow was node.id.
  // Actually, our getCategoryDetail API uses SLUG.
  // I need to make sure the store stores the SLUG or I find the slug from the ID.
  
  // HACK: For now, I'll assume activeNodeId IS the slug if we passed node.slug as ID in RoadmapCanvas.
  // Let's check RoadmapCanvas. I passed node.id. 
  // I should update RoadmapCanvas to pass node.slug as the ID if I want to use it here.
  // OR I can use the slug from the node data.
  
  const { data: category, isLoading } = useCategoryDetailQuery(activeNodeId || "");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Hard": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default: return "text-muted-foreground bg-muted/50";
    }
  };

  return (
    <Sheet open={!!activeNodeId} onOpenChange={(open) => !open && setActiveNodeId(null)}>
      <SheetContent className="sm:max-w-md border-l bg-card/80 backdrop-blur-2xl flex flex-col p-0 shadow-2xl">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Data...</p>
            </div>
          </div>
        ) : category ? (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            <SheetHeader className="p-8 pb-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  <Flame className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">In Focus</span>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                  Pattern ID: {category.id.split('-')[0]}
                </div>
              </div>
              
              <div className="space-y-2">
                <SheetTitle className="text-3xl font-black tracking-tighter leading-none text-foreground uppercase italic">
                  {category.name}
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {category.description || "Master this specific algorithmic pattern to level up your technical skills."}
                </SheetDescription>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest block mb-1">Missions</span>
                  <span className="text-2xl font-black tabular-nums tracking-tighter">{category.problems?.length || 0}</span>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="text-[9px] uppercase text-primary font-black tracking-widest block mb-1">XP Gain</span>
                  <span className="text-2xl font-black tabular-nums tracking-tighter text-primary">+{ (category.problems?.length || 0) * 100 }</span>
                </div>
              </div>
            </SheetHeader>

            <Separator className="opacity-50" />

            <ScrollArea className="flex-1 px-8">
              <div className="py-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    Curated Queue
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-60">
                    Auto-Sorted
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {category.problems && category.problems.length > 0 ? (
                    category.problems.map((problem, index) => (
                      <Link 
                        key={problem.problem_id} 
                        href={`/practice/${problem.problem_slug}`}
                        className="group block"
                      >
                        <div className="relative p-4 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/50 hover:bg-muted/40 transition-all duration-300 active:scale-[0.98] overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                          
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="text-lg font-black text-muted-foreground/30 tabular-nums italic group-hover:text-primary/40 transition-colors">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold group-hover:text-primary transition-colors tracking-tight">
                                  {problem.title}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn("text-[8px] px-1.5 h-3.5 font-black uppercase tracking-tighter border-none", getDifficultyColor(problem.difficulty))}>
                                    {problem.difficulty}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 uppercase">
                                    <Clock className="w-2.5 h-2.5" />
                                    15-20m
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-20 px-6 space-y-4 bg-muted/10 rounded-3xl border border-dashed border-border/50">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <Map className="w-8 h-8 text-muted-foreground opacity-30" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-muted-foreground tracking-tight">No Missions Found</p>
                        <p className="text-[11px] text-muted-foreground/60 font-medium">This pattern is currently being populated by the arena masters.</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-full border-muted-foreground/20">
                        Stay Alert
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="p-8 bg-muted/20 border-t border-border/50 backdrop-blur-md">
              <Button className="w-full h-12 shadow-2xl shadow-primary/20 rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-3" size="lg">
                <Trophy className="w-4 h-4" />
                Initialize Training
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="p-4 bg-destructive/10 rounded-full border border-destructive/20">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-2xl tracking-tighter uppercase italic">Offline Link</p>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">The connection to this node was severed. Attempting to reconnect...</p>
            </div>
            <Button 
              variant="outline" 
              className="font-bold uppercase tracking-widest h-12 px-8 rounded-2xl border-2"
              onClick={() => setActiveNodeId(null)}
            >
              Back to Roadmap
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default RoadmapSidebar;
