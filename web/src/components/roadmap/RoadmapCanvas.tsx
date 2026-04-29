"use client";

import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  useReactFlow,
  ConnectionMode,
} from "reactflow";
import dagre from "@dagrejs/dagre";
import { motion } from "framer-motion";
import "reactflow/dist/style.css";

import TaxonomyNode from "./TaxonomyNode";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import type { CategoryTreeNode } from "@/types/taxonomy";
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

const nodeTypes = {
  taxonomyNode: TaxonomyNode,
};

/**
 * Visual-only learning path between root categories.
 * Maps a category slug to the slugs it "leads to" in the tree view.
 * This is purely for the UI layout — no database changes needed.
 */
const LEARNING_PATH: Record<string, string[]> = {
  // Level 1 (1 node): The Root
  array: ["string", "stack"],

  // Level 2 (2 nodes): First Branch
  string: ["hash-map", "queue-deque"],
  stack: ["linked-list"],

  // Level 3 (3 nodes): Wide Spread → all converge into Trees
  "hash-map": ["trees"],
  "queue-deque": ["trees"],
  "linked-list": ["trees"],

  // Level 4 (1 node): The Convergence Hub
  trees: ["trie", "recursion"],

  // Level 5 (2 nodes): Second Branch
  trie: ["heap-priority-queue"],
  recursion: ["graphs", "dynamic-programming"],

  // Level 6 (3 nodes): Specialist Paths
  "heap-priority-queue": ["greedy", "sorting-algorithms"],
  graphs: ["range-structures"],
  "dynamic-programming": ["bit-manipulation"],

  // Level 7 (4 nodes): Widest Row → all converge into Math
  greedy: ["math-geometry"],
  "sorting-algorithms": ["math-geometry"],
  "range-structures": ["math-geometry"],
  "bit-manipulation": ["math-geometry"],

  // Level 8 (1 node): The Final Convergence
  "math-geometry": [],
};

interface RoadmapCanvasProps {
  data: CategoryTreeNode[];
  onNodeClick?: (category: CategoryTreeNode) => void;
}

const RoadmapCanvas = ({ data, onNodeClick }: RoadmapCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, zoomTo } = useReactFlow();

  const {
    drilledRootId,
    expandedNodeIds,
    setDrilledRootId,
    toggleNodeExpansion,
    setActiveNodeId,
    activeNodeId,
    resetRoadmap,
  } = useRoadmapStore();

  const getLayoutedElements = useCallback(
    (
      graphParts: {
        nodes: Node[];
        localEdges: Edge[];
        direction?: "TB" | "LR";
      }[],
    ) => {
      let currentXOffset = 0;
      const allNodes: Node[] = [];
      const allEdges: Edge[] = [];
      const columnGap = 500; // Large spacing between disconnected trees

      const nodeWidth = 400;
      const nodeHeight = 160;

      graphParts.forEach((part) => {
        if (part.nodes.length === 0) return;

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const isLR = part.direction === "LR";

        // Layout this specific part
        dagreGraph.setGraph({
          rankdir: isLR ? "LR" : "TB",
          ranksep: isLR ? 360 : 130, // horizontal gap if LR, vertical if TB
          nodesep: isLR ? 130 : 360, // vertical gap if LR, horizontal if TB
          marginx: 0,
          marginy: 80,
        });

        part.nodes.forEach((node) => {
          dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        part.localEdges.forEach((edge) => {
          dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        let minX = Infinity;
        let maxX = -Infinity;

        // Shift nodes to align columns properly
        const layoutedNodes = part.nodes.map((node) => {
          const nodeWithPosition = dagreGraph.node(node.id);

          if (nodeWithPosition.x - nodeWidth / 2 < minX)
            minX = nodeWithPosition.x - nodeWidth / 2;
          if (nodeWithPosition.x + nodeWidth / 2 > maxX)
            maxX = nodeWithPosition.x + nodeWidth / 2;

          return { ...node, position: { ...nodeWithPosition } };
        });

        const shiftX = currentXOffset - minX;

        layoutedNodes.forEach((node) => {
          node.position.x = node.position.x - nodeWidth / 2 + shiftX;
          node.position.y = node.position.y - nodeHeight / 2;
        });

        allNodes.push(...layoutedNodes);
        allEdges.push(...part.localEdges);

        currentXOffset += maxX - minX + columnGap;
      });

      return { nodes: allNodes, edges: allEdges };
    },
    [],
  );

  // Build the visual graph from tree data
  useEffect(() => {
    // Lookup maps
    const slugToId: Record<string, string> = {};
    const idToNode: Record<string, CategoryTreeNode> = {};

    const traverse = (n: CategoryTreeNode) => {
      idToNode[n.id] = n;
      n.children?.forEach(traverse);
    };

    data.forEach((rootNode) => {
      slugToId[rootNode.slug] = rootNode.id;
      traverse(rootNode);
    });

    const graphParts: {
      nodes: Node[];
      localEdges: Edge[];
      direction?: "TB" | "LR";
    }[] = [];

    // --- PART 0: Main Tree ---
    const mainNodes: Node[] = [];
    const mainLocalEdges: Edge[] = [];

    data.forEach((rootNode) => {
      const isExpanded = drilledRootId === rootNode.id;
      const isActive = drilledRootId
        ? isExpanded
        : activeNodeId === rootNode.id;

      mainNodes.push({
        id: rootNode.id,
        type: "taxonomyNode",
        data: {
          ...rootNode,
          depth: 0,
          isExpanded,
          isActive,
          isRoot: true,
          direction: "TB",
        },
        position: { x: 0, y: 0 },
        style: {
          opacity: drilledRootId && !isExpanded ? 0.35 : 1,
          transition: "opacity 0.5s ease-in-out",
        },
      });
    });

    Object.entries(LEARNING_PATH).forEach(([parentSlug, childSlugs]) => {
      const parentId = slugToId[parentSlug];
      if (!parentId) return;

      const isSourceExpanded = drilledRootId === parentId;
      const isSourceActive = drilledRootId
        ? isSourceExpanded
        : activeNodeId === parentId;

      childSlugs.forEach((childSlug) => {
        const childId = slugToId[childSlug];
        if (!childId) return;

        const isTargetExpanded = drilledRootId === childId;
        const isTargetActive = drilledRootId
          ? isTargetExpanded
          : activeNodeId === childId;

        const isEdgeActive =
          isSourceActive ||
          isTargetActive ||
          isSourceExpanded ||
          isTargetExpanded;

        mainLocalEdges.push({
          id: `path-${parentId}-${childId}`,
          source: parentId,
          target: childId,
          type: "default",
          animated: isEdgeActive,
          style: {
            strokeWidth: isEdgeActive ? 6 : 4,
            stroke: isEdgeActive
              ? "var(--primary)"
              : "color-mix(in srgb, var(--primary), transparent 70%)",
            transition: "all 0.5s ease",
          },
        });
      });
    });

    graphParts.push({
      nodes: mainNodes,
      localEdges: mainLocalEdges,
      direction: "TB",
    });

    // --- PART 1: Sub-Tree (Inline Expansion) ---
    if (drilledRootId) {
      const parentData = idToNode[drilledRootId];

      if (parentData && parentData.children && parentData.children.length > 0) {
        const subNodes: Node[] = [];
        const subLocalEdges: Edge[] = [];
        const subRootId = parentData.id + "-subroot";

        // The drilled node acts as the visual root for its own column
        subNodes.push({
          id: subRootId,
          type: "taxonomyNode",
          data: {
            ...parentData,
            id: subRootId, // required to prevent id collisions
            depth: 0,
            isExpanded: true,
            isActive:
              activeNodeId === subRootId || activeNodeId === parentData.id,
            isRoot: true,
            direction: "LR",
          },
          position: { x: 0, y: 0 },
        });

        // Recursively add children
        const addChildren = (
          parentNodeData: CategoryTreeNode,
          currentVisualParentId: string,
          depth: number,
        ) => {
          parentNodeData.children?.forEach((child) => {
            const isExpanded = expandedNodeIds.has(child.id);
            const isActive = activeNodeId === child.id;

            subNodes.push({
              id: child.id,
              type: "taxonomyNode",
              data: {
                ...child,
                depth,
                isExpanded,
                isActive,
                isRoot: false,
                direction: "LR",
              },
              position: { x: 0, y: 0 },
            });

            subLocalEdges.push({
              id: `e-${currentVisualParentId}-${child.id}`,
              source: currentVisualParentId,
              target: child.id,
              type: "default",
              animated: isExpanded || isActive,
              style: {
                strokeWidth: isExpanded || isActive ? 6 : 4,
                stroke:
                  isExpanded || isActive
                    ? "var(--primary)"
                    : "color-mix(in srgb, var(--primary), transparent 70%)",
                transition: "all 0.5s ease",
              },
            });

            if (isExpanded) {
              addChildren(child, child.id, depth + 1);
            }
          });
        };

        // Start recursion from subroot
        addChildren(parentData, subRootId, 1);

        graphParts.push({
          nodes: subNodes,
          localEdges: subLocalEdges,
          direction: "LR",
        });
      }
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedElements(graphParts);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [
    data,
    drilledRootId,
    expandedNodeIds,
    activeNodeId,
    getLayoutedElements,
    setNodes,
    setEdges,
  ]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const category = node.data as CategoryTreeNode;
      const depth = (node.data as any).depth || 0;

      // Handle the visual subroot ID mapping back to the real ID
      const realId = node.id.endsWith("-subroot")
        ? node.id.replace("-subroot", "")
        : node.id;

      setActiveNodeId(realId);

      let targetNodeId = node.id;

      if (category.parentId === null || depth === 0) {
        // If they click the subroot, close it entirely
        if (node.id.endsWith("-subroot")) {
          setDrilledRootId(null);
          targetNodeId = realId;
        } else {
          // If clicking a new root on the main tree, switch to it
          if (drilledRootId !== realId) {
            setDrilledRootId(realId);
          } else {
            // If clicking the same root again, do nothing or collapse (store handles it)
            setDrilledRootId(realId);
          }
          if (category.children && category.children.length > 0) {
            targetNodeId = realId + "-subroot";
          }
        }
      } else {
        toggleNodeExpansion(realId);
        // If we expanded it, center on it, if collapsed, center on parent
        targetNodeId = realId;
      }

      // Wait for layout to finish, then pan/zoom directly to the target node
      setTimeout(() => {
        // HOW TO CONTROL ZOOM:
        // 'maxZoom' controls how far it can zoom in. Lower number (e.g. 0.4) = less zoomed in.
        // 'padding' controls the space around the focused node. Higher number (e.g. 3) = more space.
        fitView({
          nodes: [{ id: targetNodeId }],
          duration: 1000,
          padding: 1.5,
          maxZoom: 0.5,
        });
      }, 100);

      if (onNodeClick) {
        onNodeClick(category);
      }
    },
    [
      setDrilledRootId,
      toggleNodeExpansion,
      setActiveNodeId,
      fitView,
      onNodeClick,
    ],
  );

  return (
    <div className="w-full h-full bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
      >
        {/* <Background
          color="currentColor"
          gap={24}
          size={2}
          className="text-muted-foreground/10"
        /> */}
        {/* Floating Control Hub */}
        <Panel position="bottom-center" className="mb-6">
          <Card className="flex items-center gap-2 p-2 bg-card border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => zoomTo(nodes.length > 0 ? 0.5 : 1)}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="secondary"
              className="gap-2 px-4 font-bold text-xs uppercase tracking-widest"
              onClick={() => {
                resetRoadmap();
                setTimeout(() => fitView({ duration: 1000, padding: 0.3 }), 50);
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset View
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="icon" onClick={() => zoomTo(1.2)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const Separator = ({
  className,
  orientation,
}: {
  className?: string;
  orientation?: string;
}) => (
  <div
    className={cn(
      "bg-border",
      orientation === "vertical" ? "w-[1px] h-full" : "h-[1px] w-full",
      className,
    )}
  />
);

export default RoadmapCanvas;
