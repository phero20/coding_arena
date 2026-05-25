import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimelineViewProps {
  levels: { id: string; label: string }[][];
  onConceptClick?: (slug: string, name: string) => void;
}

export function TimelineView({ levels, onConceptClick }: TimelineViewProps) {
  // Gamified geometric shapes inspired by the About Tab
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
            <div className="w-12 h-12 relative flex items-center justify-center z-10 shrink-0 text-foreground drop-shadow-sm transition-transform hover:scale-110">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
                {getShape(i)}
              </svg>
              <span className="relative z-20 font-bold text-slate-900">{i + 1}</span>
            </div>

            {/* Dashed SVG Path connecting to the next node */}
            {i < levels.length - 1 && (
              <div className="w-6 h-full absolute top-12 -bottom-6 z-0 flex justify-center">
                <svg className="w-full h-full text-muted-foreground/40" preserveAspectRatio="none">
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          {/* Content Card */}
          <Card className="flex-1 bg-transparent shadow-none border-0 border-b rounded-none pb-0 mb-8">
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
                {level.map((node) => (
                  <Badge 
                    key={node.id} 
                    variant="secondary"
                    className="font-normal text-sm px-3 py-1 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => onConceptClick?.(node.id, node.label)}
                  >
                    {node.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
