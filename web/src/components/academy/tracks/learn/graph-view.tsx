import React, { useState, useMemo } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { ConceptNode } from "./concept-node";

interface GraphViewProps {
  levels: { id: string; label: string }[][];
  edges: { source: string; target: string }[];
  onConceptClick?: (slug: string, name: string) => void;
}

export function GraphView({ levels, edges, onConceptClick }: GraphViewProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    
    const connected = new Set<string>();
    connected.add(hoveredNode);

    // BFS to find all descendants (nodes that require the hovered node)
    const qDesc = [hoveredNode];
    while(qDesc.length > 0) {
      const curr = qDesc.shift()!;
      edges.forEach(e => {
        if (e.source === curr && !connected.has(e.target)) {
          connected.add(e.target);
          qDesc.push(e.target);
        }
      });
    }

    // BFS to find all ancestors (nodes that the hovered node requires)
    const qAnc = [hoveredNode];
    while(qAnc.length > 0) {
      const curr = qAnc.shift()!;
      edges.forEach(e => {
        if (e.target === curr && !connected.has(e.source)) {
          connected.add(e.source);
          qAnc.push(e.source);
        }
      });
    }

    return connected;
  }, [hoveredNode, edges]);

  return (
    <div className="relative py-10">
      <Xwrapper>
        <div className="flex flex-col items-center gap-12 md:gap-24 w-full relative z-10">
          {levels.map((level, i) => (
            <div
              key={i}
              className="flex flex-row flex-wrap items-center justify-center gap-10 md:gap-28 w-full"
            >
              {level.map((node) => {
                const isFaded = hoveredNode !== null && !connectedNodes.has(node.id);
                return (
                  <div 
                    key={node.id} 
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => onConceptClick?.(node.id, node.label)}
                    className={`transition-all duration-300 ease-in-out cursor-pointer ${
                      isFaded ? 'opacity-20 blur-[1px] scale-95' : 'opacity-100 blur-none scale-100'
                    }`}
                  >
                    <ConceptNode id={node.id} label={node.label} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {edges.map((e) => {
          // An edge is connected if BOTH of its endpoints are in the connected set
          const isEdgeConnected = hoveredNode !== null && connectedNodes.has(e.source) && connectedNodes.has(e.target);
          
          // Use Tailwind classes to drive the currentColor of the SVG stroke
          const arrowClass = hoveredNode === null 
            ? "text-muted-foreground opacity-20" 
            : isEdgeConnected 
              ? "text-primary opacity-60" 
              : "text-muted-foreground opacity-20";

          return (
            <Xarrow
              key={`${e.source}-${e.target}`}
              start={e.source}
              end={e.target}
              color="currentColor" // This forces Xarrow to inherit the color from the CSS classes below
              strokeWidth={2}
              // If connected, animate the dashed line to flow toward the descendants!
              dashness={
                 { strokeLen: 8, nonStrokeLen: 4, animation: false }
              }
              showHead={false}
              path="smooth"
              startAnchor="bottom"
              endAnchor="top"
              passProps={{
                className: `transition-all duration-300 ease-in-out ${arrowClass}`,
                style: { pointerEvents: "none" }
              }}
            />
          );
        })}
      </Xwrapper>
    </div>
  );
}
