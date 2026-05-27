import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CheckCircle2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  levels: { id: string; label: string }[][];
  onConceptClick?: (slug: string, name: string) => void;
  conceptProgressMap?: Record<string, { status: "COMPLETED" | "IN_PROGRESS" | "LOCKED", progress: number, total: number }>;
}

export function TimelineView({ levels, onConceptClick, conceptProgressMap = {} }: TimelineViewProps) {
  // Gamified geometric shapes inspired by the About Tab



const tones = [
  {
    accent: 'text-yellow-400',
    hoverAccent: 'hover:text-yellow-400',
    chipBg: 'bg-yellow-500/15',
    chipBorder: 'border-yellow-400/50',
    ring: 'hover:ring-yellow-400/40',
    fill: '#facc15',
    icon: 'circle' as const,
  },
  {
    accent: 'text-emerald-400',
    hoverAccent: 'hover:text-emerald-400',
    chipBg: 'bg-emerald-500/15',
    chipBorder: 'border-emerald-400/50',
    ring: 'hover:ring-emerald-400/40',
    fill: '#34d399',
    icon: 'diamond' as const,
  },
  {
    accent: 'text-sky-400',
    hoverAccent: 'hover:text-sky-400',
    chipBg: 'bg-sky-500/15',
    chipBorder: 'border-sky-400/50',
    ring: 'hover:ring-sky-400/40',
    fill: '#60a5fa',
    icon: 'hex' as const,
  },
];










  const getShape = (i: number) => {
    switch (i % 3) {
      case 0: // Yellow circle
        return <circle cx="12" cy="12" r="9" fill="#facc15" />;
      case 1: // Green diamond
        return <rect x="4" y="4" width="16" height="16" fill="#34d399" transform="rotate(45 12 12)" />;
      case 2: // Blue hexagon
        return <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" fill="#60a5fa" />;
      default:
        return <circle cx="12" cy="12" r="9" fill="#facc15" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pt-4 pb-12">
      {levels.map((level, i) => (
        <div key={`phase-${i}`} className="relative flex flex-row gap-4 sm:gap-6">
          
          {/* Visual Timeline Marker with SVG Shapes */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-12 h-12 relative flex items-center justify-center z-10 shrink-0 text-foreground drop-shadow-sm">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
                {getShape(i)}
              </svg>
              <span className="relative z-20 font-bold text-slate-900">{i + 1}</span>
            </div>

            {/* Path connecting to the next node */}
            {i < levels.length - 1 && (() => {
              const completedConceptsInPhase = level.filter(node => conceptProgressMap[node.id]?.status === "COMPLETED").length;
              const completionPercentage = level.length > 0 ? (completedConceptsInPhase / level.length) * 100 : 0;
              
              return (
                <div className="w-6 h-full absolute top-12 -bottom-6 z-0 flex justify-center">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    {/* Background dashed line */}
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
                    
                    {/* Foreground solid line representing progress */}
                    {completionPercentage > 0 && (
                      <line x1="50%" y1="0" x2="50%" y2={`${completionPercentage}%`} stroke="currentColor" className="text-difficulty-easy transition-all duration-1000 ease-in-out" strokeWidth="3.5" strokeLinecap="round" />
                    )}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Content Card */}
          <Card className={cn("flex-1 bg-transparent shadow-none border-0 border-b rounded-none pb-0 mb-8")}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Phase {i + 1}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {level.length} {level.length === 1 ? "Concept" : "Concepts"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {level.map((node) => {
                  const progressData = conceptProgressMap[node.id];
                  const isCompleted = progressData?.status === "COMPLETED";
                  const isInProgress = progressData?.status === "IN_PROGRESS";
                  const tone = tones[i % tones.length];
                  
                  return (
                    <Badge 
                      key={node.id} 
                      variant="secondary"
                      className={cn(
                        "font-normal text-sm px-3 py-1.5 cursor-pointer transition-colors flex items-center gap-1.5 hover:ring-1",
                        tone.hoverAccent,
                        tone.ring,
                        isCompleted 
                          ? "bg-difficulty-easy/20 border-difficulty-easy/30 ring-1 ring-difficulty-easy/20" 
                          : isInProgress 
                            && cn(tone.chipBg, tone.accent, "hover:opacity-80 border-dashed", tone.chipBorder)
                            
                      )}
                      onClick={() => onConceptClick?.(node.id, node.label)}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-difficulty-easy" />}
                      {isInProgress && <CircleDashed className={cn("w-3.5 h-3.5", tone.accent)} />}
                      {node.label}
                      {progressData && progressData.total > 0 && (
                        <span className="opacity-50 ml-1 text-xs">
                          ({progressData.progress}/{progressData.total})
                        </span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
