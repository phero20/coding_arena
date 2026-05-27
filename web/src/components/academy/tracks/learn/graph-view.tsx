import React, { useState, useMemo } from "react";
import Xarrow, { Xwrapper } from "react-xarrows";
import { ConceptNode } from "./concept-node";

interface GraphViewProps {
  levels: { id: string; label: string }[][];
  edges: { source: string; target: string }[];
  onConceptClick?: (slug: string, name: string) => void;
  conceptProgressMap?: Record<string, { status: "COMPLETED" | "IN_PROGRESS" | "LOCKED"; progress: number; total: number }>;
}

export function GraphView({ levels, edges, onConceptClick, conceptProgressMap = {} }: GraphViewProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const edgePalette = ["#60a5fa", "#34d399", "#facc15", "#f472b6", "#a78bfa"];

  const edgeColorFor = (sourceId: string) => {
    let hash = 0;
    for (let i = 0; i < sourceId.length; i++) {
      hash = (hash * 31 + sourceId.charCodeAt(i)) >>> 0;
    }
    return edgePalette[hash % edgePalette.length];
  };

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
                      isFaded ? "opacity-20 blur-[1px] scale-95" : "opacity-100 blur-none scale-100"
                    }`}
                  >
                    <ConceptNode
                      id={node.id}
                      label={node.label}
                      toneSeed={`${i}-${node.id}`}
                      progressData={conceptProgressMap[node.id]}
                    />
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
            ? "opacity-25"
            : isEdgeConnected
              ? "opacity-85"
              : "opacity-15";

          return (
            <Xarrow
              key={`${e.source}-${e.target}`}
              start={e.source}
              end={e.target}
              color={isEdgeConnected ? edgeColorFor(e.source) : "#64748b"}
              strokeWidth={isEdgeConnected ? 2.6 : 1.8}
              // If connected, animate the dashed line to flow toward the descendants!
              dashness={
                isEdgeConnected
                  ? { strokeLen: 8, nonStrokeLen: 4, animation: true }
                  : { strokeLen: 6, nonStrokeLen: 6, animation: false }
              }
              showHead={false}
              path="smooth"
              startAnchor="bottom"
              endAnchor="top"
              passProps={{
                className: `transition-all duration-300 ease-in-out ${arrowClass}`,
                style: { pointerEvents: "none" },
              }}
            />
          );
        })}
      </Xwrapper>
    </div>
  );
}
