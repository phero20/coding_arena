import { useChatStore } from "@/store/use-chat-store";
import { useDiagramStore } from "@/store/use-diagram-store";
import type {
  CanvasGraph,
  CanvasFrame,
  SemanticNode,
  SemanticEdge,
  LLMCanvasAction,
  LLMCanvasActionCreate,
  LLMCanvasActionUpdate,
  SemanticGroup,
} from "@/types/chat";
import { useCallback } from "react";
import { createShapeId, createBindingId } from "tldraw";
import dagre from "@dagrejs/dagre";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const ICON_SIZE = 120;
const FRAME_PADDING = 80;
const DAGRE_NODESEP = 80;
const DAGRE_RANKSEP = 240;

// Group layer visual padding constants
const GROUP_PADDING_X = 60;
const GROUP_PADDING_TOP = 80;   // extra top room for the label
const GROUP_PADDING_BOTTOM = 60;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Prevent double-prefixing of shape IDs */
const safeCreateShapeId = (id: string) => {
  if (id.startsWith("shape:")) return id as any;
  return createShapeId(id);
};

/**
 * Extract the semantic ID from a full Tldraw shape ID.
 * e.g. "shape:diag_1716300000_nodejs-server" → "nodejs-server"
 * Falls back to stripping only the "shape:" prefix if no diag_ prefix found.
 */
const extractSemanticId = (tldrawId: string): string => {
  const withoutPrefix = tldrawId.replace(/^shape:/, "");
  const diagMatch = withoutPrefix.match(/^diag_\d+_(.+)$/);
  if (diagMatch) return diagMatch[1];
  return withoutPrefix;
};

const getShapeRichTextValue = (shape: any): string => {
  return (
    shape?.props?.richText?.content?.[0]?.content?.[0]?.text ||
    shape?.props?.text ||
    shape?.props?.title ||
    ""
  );
};

const isFrameRelativeShape = (shape: any, frameId: string) => {
  return shape?.parentId === frameId;
};

const isConnectorShape = (shape: any) => {
  return shape?.type === "arrow" || shape?.type === "line";
};

const estimateTextWidth = (text: string, fontSize = 12) => {
  const cleanText = (text || "").trim();
  const lines = cleanText.split(/\n+/);
  const longestLine = lines.reduce((longest, line) => Math.max(longest, line.length), 0);
  return Math.max(120, Math.min(560, Math.ceil(longestLine * fontSize * 0.62) + 32));
};

const estimateTextHeight = (text: string, fontSize = 12) => {
  const cleanText = (text || "").trim();
  const lines = cleanText ? cleanText.split(/\n+/).length : 1;
  return Math.max(24, Math.ceil(lines * fontSize * 1.4) + 12);
};

const collectDescendants = (shapes: any[], parentId: string) => {
  const childrenByParent = new Map<string, any[]>();
  for (const shape of shapes) {
    if (!shape.parentId) continue;
    const bucket = childrenByParent.get(shape.parentId) || [];
    bucket.push(shape);
    childrenByParent.set(shape.parentId, bucket);
  }

  const descendants: any[] = [];
  const queue = [...(childrenByParent.get(parentId) || [])];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const shape = queue.shift();
    if (!shape || visited.has(shape.id)) continue;
    visited.add(shape.id);
    descendants.push(shape);
    const children = childrenByParent.get(shape.id) || [];
    queue.push(...children);
  }

  return descendants;
};

const resolveRelativePositionToFrame = (
  shape: any,
  shapeById: Map<string, any>,
  frameId: string,
) => {
  let x = shape?.x ?? 0;
  let y = shape?.y ?? 0;
  let currentParentId = shape?.parentId;

  while (currentParentId && currentParentId !== frameId) {
    const parentShape = shapeById.get(currentParentId);
    if (!parentShape) break;
    x += parentShape.x ?? 0;
    y += parentShape.y ?? 0;
    currentParentId = parentShape.parentId;
  }

  return { x, y };
};

const getShapePageBoundsBox = (editor: any, shapeId: string) => {
  const bounds = editor?.getShapePageBounds?.(shapeId);
  if (!bounds) return null;

  return {
    minX: bounds.minX,
    minY: bounds.minY,
    maxX: bounds.maxX,
    maxY: bounds.maxY,
  };
};

const expandBounds = (
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null,
  next: { minX: number; minY: number; maxX: number; maxY: number } | null,
) => {
  if (!next) return bounds;
  if (!bounds) return { ...next };

  return {
    minX: Math.min(bounds.minX, next.minX),
    minY: Math.min(bounds.minY, next.minY),
    maxX: Math.max(bounds.maxX, next.maxX),
    maxY: Math.max(bounds.maxY, next.maxY),
  };
};

// ─── Layout Engine ───────────────────────────────────────────────────────────

/**
 * BUG #1 FIX: Run Dagre WITHOUT compound mode.
 * Compound mode in Dagre breaks rankdir:"LR" when clusters are disconnected —
 * it stacks everything vertically. Instead we run a flat LR layout on the
 * actual icon nodes and then compute group bounding boxes ourselves from the
 * resulting node positions.
 */
function runDagre(
  nodes: Array<{ id: string; groupId?: string }>,
  edges: Array<{ from: string; to: string }>
): Map<string, { x: number; y: number }> {
  // Fallback layout when there are no edges:
  // - If groups exist, render groups as LR columns and nodes stacked per group.
  // - If no groups exist, render a compact grid.
  // This avoids the frequent "single vertical stack" result from Dagre on disconnected graphs.
  if (edges.length === 0) {
    const posMap = new Map<string, { x: number; y: number }>();
    const marginX = 60;
    const marginY = 60;
    const xGap = ICON_SIZE + DAGRE_RANKSEP;
    const yGap = ICON_SIZE + DAGRE_NODESEP;

    const groupedNodes = nodes.filter((n) => n.groupId);
    const hasGroups = groupedNodes.length > 0;

    if (hasGroups) {
      const groupOrder: string[] = [];
      for (const n of nodes) {
        if (n.groupId && !groupOrder.includes(n.groupId)) {
          groupOrder.push(n.groupId);
        }
      }

      const nodesByGroup = new Map<string, Array<{ id: string; groupId?: string }>>();
      for (const groupId of groupOrder) nodesByGroup.set(groupId, []);
      for (const n of nodes) {
        if (n.groupId) {
          nodesByGroup.get(n.groupId)?.push(n);
        }
      }

      let col = 0;
      for (const groupId of groupOrder) {
        const groupNodes = nodesByGroup.get(groupId) || [];
        let row = 0;
        for (const node of groupNodes) {
          posMap.set(node.id, {
            x: marginX + col * xGap,
            y: marginY + row * yGap,
          });
          row++;
        }
        col++;
      }

      // Any ungrouped node goes to trailing columns to keep LR flow.
      const ungrouped = nodes.filter((n) => !n.groupId);
      let row = 0;
      for (const node of ungrouped) {
        posMap.set(node.id, {
          x: marginX + col * xGap,
          y: marginY + row * yGap,
        });
        row++;
      }

      return posMap;
    }

    const columns = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(nodes.length || 1))));
    for (let i = 0; i < nodes.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      posMap.set(nodes[i].id, {
        x: marginX + col * xGap,
        y: marginY + row * yGap,
      });
    }

    return posMap;
  }

  // compound: false — this is the key fix that prevents vertical stacking
  const g = new dagre.graphlib.Graph({ compound: false });
  g.setGraph({
    rankdir: "LR",
    nodesep: DAGRE_NODESEP,
    ranksep: DAGRE_RANKSEP,
    marginx: 60,
    marginy: 60,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    g.setNode(n.id, { width: ICON_SIZE, height: ICON_SIZE });
  }
  for (const e of edges) {
    if (nodeIds.has(e.from) && nodeIds.has(e.to)) {
      g.setEdge(e.from, e.to);
    }
  }

  dagre.layout(g);

  const posMap = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const node = g.node(n.id);
    if (node) {
      const isInvalid = isNaN(node.x) || isNaN(node.y);
      posMap.set(n.id, {
        x: isInvalid ? 0 : node.x - ICON_SIZE / 2,
        y: isInvalid ? 0 : node.y - ICON_SIZE / 2,
      });
    } else {
      posMap.set(n.id, { x: 0, y: 0 });
    }
  }

  return posMap;
}

/**
 * BUG #1 FIX (continued): Manually compute group bounding boxes from
 * the actual positions of the nodes that belong to each group.
 * This replaces Dagre's unreliable compound cluster sizing.
 */
function computeGroupBounds(
  nodeEntries: Array<{ id: string; groupId?: string }>,
  posMap: Map<string, { x: number; y: number }>,
  groups: Array<{ id: string; title: string }>
): Map<string, { x: number; y: number; width: number; height: number; title: string }> {
  const bounds = new Map<
    string,
    { x: number; y: number; width: number; height: number; title: string }
  >();

  for (const gr of groups) {
    const children = nodeEntries.filter((n) => n.groupId === gr.id);
    if (children.length === 0) continue;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const child of children) {
      const p = posMap.get(child.id);
      if (p) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x + ICON_SIZE > maxX) maxX = p.x + ICON_SIZE;
        if (p.y + ICON_SIZE > maxY) maxY = p.y + ICON_SIZE;
      }
    }

    if (minX === Infinity) continue;

    const titleWidth = estimateTextWidth(gr.title, 12);
    const titleHeight = estimateTextHeight(gr.title, 12);
    const contentWidth = maxX - minX + 2 * GROUP_PADDING_X;
    const contentHeight = maxY - minY + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM;

    bounds.set(gr.id, {
      x: minX - GROUP_PADDING_X,
      y: minY - GROUP_PADDING_TOP,
      width: Math.max(contentWidth, titleWidth + 32),
      height: Math.max(contentHeight, titleHeight + GROUP_PADDING_TOP + 24),
      title: gr.title,
    });
  }

  return bounds;
}

// ─── Arrow Builder ────────────────────────────────────────────────────────────

/**
 * Build arrow shapes and bindings for a list of edges.
 * Returns { edgesToCreate, bindingsToCreate }.
 */
function buildEdgeShapes(
  rawEdges: Array<{
    id: string;
    from: string; // full TLShapeId (namespaced)
    to: string;   // full TLShapeId (namespaced)
    label?: string;
  }>,
  positionMap: Map<string, { x: number; y: number }>,
  parentId: any,
  connectionCount: Map<string, number>
): { edgesToCreate: any[]; bindingsToCreate: any[] } {
  const edgesToCreate: any[] = [];
  const bindingsToCreate: any[] = [];

  for (const edge of rawEdges) {
    if (!edge.from || !edge.to) continue;

    const fromShapeId = safeCreateShapeId(edge.from);
    const toShapeId = safeCreateShapeId(edge.to);
    const arrowId = safeCreateShapeId(edge.id);

    const fromPos = positionMap.get(edge.from) ?? { x: 0, y: 0 };
    const toPos = positionMap.get(edge.to) ?? { x: 200, y: 0 };

    const half = ICON_SIZE / 2;
    const sx = fromPos.x + half;
    const sy = fromPos.y + half;
    const ex = toPos.x + half;
    const ey = toPos.y + half;

    const key = [edge.from, edge.to].sort().join("<->");
    const count = connectionCount.get(key) ?? 0;
    connectionCount.set(key, count + 1);

    let bendVal = -25;
    if (count > 0) {
      const sign = count % 2 === 0 ? -1 : 1;
      bendVal = sign * (25 + Math.floor(count / 2) * 20);
    }

    const arrowProps: any = {
      start: { x: 0, y: 0 },
      end: { x: ex - sx, y: ey - sy },
      color: "grey",
      dash: "solid",
      size: "s",
      bend: bendVal,
      font: "sans",
    };

    if (edge.label) {
      arrowProps.richText = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: edge.label }],
          },
        ],
      };
    }

    edgesToCreate.push({
      id: arrowId,
      parentId,
      type: "arrow",
      x: sx,
      y: sy,
      props: arrowProps,
    });

    bindingsToCreate.push(
      {
        id: createBindingId(),
        type: "arrow",
        fromId: arrowId,
        toId: fromShapeId,
        props: {
          terminal: "start",
          isExact: false,
          isPrecise: true,
        },
      },
      {
        id: createBindingId(),
        type: "arrow",
        fromId: arrowId,
        toId: toShapeId,
        props: {
          terminal: "end",
          isExact: false,
          isPrecise: true,
        },
      }
    );
  }

  return { edgesToCreate, bindingsToCreate };
}

// ─── Group Visual Shape Builder ────────────────────────────────────────────────

const LAYER_COLORS = ["blue", "green", "orange", "violet", "yellow", "red", "grey"] as const;

function buildGroupShapes(
  groupBounds: Map<string, { x: number; y: number; width: number; height: number; title: string }>,
  parentId: any
): any[] {
  const shapes: any[] = [];
  let colorIdx = 0;

  for (const [namespacedGroupId, gb] of groupBounds) {
    const color = LAYER_COLORS[colorIdx % LAYER_COLORS.length];
    colorIdx++;

    // Semitransparent background fill
    shapes.push({
      id: safeCreateShapeId(`${namespacedGroupId}-bg`),
      parentId,
      type: "geo",
      x: gb.x,
      y: gb.y,
      opacity: 0.45,
      props: {
        geo: "rectangle",
        w: gb.width,
        h: gb.height,
        color,
        fill: "solid",
      },
      meta: { isGroup: true, groupId: namespacedGroupId },
    });

    // Solid border
    shapes.push({
      id: safeCreateShapeId(namespacedGroupId),
      parentId,
      type: "geo",
      x: gb.x,
      y: gb.y,
      opacity: 1,
      props: {
        geo: "rectangle",
        w: gb.width,
        h: gb.height,
        color,
        fill: "none",
        dash: "solid",
      },
      meta: { isGroup: true, groupId: namespacedGroupId },
    });

    // Label text — uses richText (Tldraw v5 requirement, plain "text" prop is rejected)
    if (gb.title) {
      shapes.push({
        id: safeCreateShapeId(`${namespacedGroupId}-label`),
        parentId,
        type: "text",
        x: gb.x + 16,
        y: gb.y + 16,
        props: {
          color,
          size: "s",
          font: "sans",
          autoSize: true,
          richText: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: gb.title }],
              },
            ],
          },
        },
        meta: { isGroup: true, groupId: namespacedGroupId },
      });
    }
  }

  return shapes;
}

// ─── Canvas Graph Builder ─────────────────────────────────────────────────────

/**
 * Build the canvasGraph from the current tldraw page.
 *
 * BUG #6 FIX: Only "system-icon" shapes are reported as semantic nodes.
 * Group visual shapes (geo rectangles + text labels) are NOT nodes — sending
 * them to the LLM as nodes caused hallucinated "geo-rectangle" nodes, corrupted
 * semanticIds, and broken edge references.
 */
function buildCanvasGraph(tldrawEditor: any): {
  canvasGraph: CanvasGraph;
  semanticMap: Map<string, string>;      // semanticId → full TLShapeId (icon shapes only)
  framePrefixMap: Map<string, string>;   // frameId → diag_TIMESTAMP_ prefix
} {
  const allShapes: any[] = tldrawEditor.getCurrentPageShapes() || [];

  const childrenByParent = new Map<string, any[]>();
  for (const shape of allShapes) {
    if (!shape.parentId) continue;
    const bucket = childrenByParent.get(shape.parentId) || [];
    bucket.push(shape);
    childrenByParent.set(shape.parentId, bucket);
  }

  const collectDescendants = (parentId: string): any[] => {
    const descendants: any[] = [];
    const queue = [...(childrenByParent.get(parentId) || [])];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const shape = queue.shift();
      if (!shape || visited.has(shape.id)) continue;
      visited.add(shape.id);
      descendants.push(shape);
      const children = childrenByParent.get(shape.id) || [];
      queue.push(...children);
    }

    return descendants;
  };

  const frames = allShapes.filter((s: any) => s.type === "frame");
  const shapeById = new Map<string, any>();
  for (const s of allShapes) shapeById.set(s.id, s);

  // BUG #4 FIX: semanticMap only maps to system-icon shapes, never group decorators.
  const semanticMap = new Map<string, string>();
  const framePrefixMap = new Map<string, string>();
  const canvasFrames: CanvasFrame[] = [];

  for (const frame of frames) {
    const frameChildren = collectDescendants(frame.id).filter(
      (s: any) => s.type !== "arrow" && s.type !== "frame"
    );

    // BUG #6 FIX: Only icon shapes become semantic nodes
    const iconChildren = frameChildren.filter((s: any) => s.type === "system-icon");
    const nodes: SemanticNode[] = [];
    let framePrefix = "";

    for (const child of iconChildren) {
      const semId = extractSemanticId(child.id);
      const techType = child.props?.assetId || child.props?.type || child.type || "linux";
      const label = child.props?.label || child.props?.text || child.props?.title || "";
      const groupId = child.meta?.groupId as string | undefined;

      nodes.push({ semanticId: semId, techType, label, groupId });
      // BUG #4 FIX: only register icon shapes in semanticMap
      semanticMap.set(semId, child.id);

      if (!framePrefix) {
        const stripped = child.id.replace(/^shape:/, "");
        const m = stripped.match(/^(diag_\d+_)/);
        if (m) framePrefix = m[1];
      }
    }

    if (!framePrefix) framePrefix = `diag_${Date.now()}_`;
    framePrefixMap.set(frame.id, framePrefix);

    // Build edges from bindings (more reliable than reading start/end boundShapeId)
    const iconIds = new Set(iconChildren.map((c: any) => c.id));
    const arrows = allShapes.filter(
      (s: any) => s.type === "arrow" && s.parentId === frame.id
    );
    const allBindings: any[] = tldrawEditor.store.allRecords().filter(
      (r: any) => r.typeName === "binding"
    );

    const edges: SemanticEdge[] = [];
    for (const arrow of arrows) {
      const startBind = allBindings.find(
        (b: any) => b.fromId === arrow.id && b.props?.terminal === "start"
      );
      const endBind = allBindings.find(
        (b: any) => b.fromId === arrow.id && b.props?.terminal === "end"
      );
      const fromId =
        startBind?.toId ||
        arrow.props?.start?.boundShapeId ||
        arrow.props?.start?.shapeId ||
        "";
      const toId =
        endBind?.toId ||
        arrow.props?.end?.boundShapeId ||
        arrow.props?.end?.shapeId ||
        "";

      if (!fromId || !toId) continue;
      // Only report edges between actual icon nodes (not group shapes)
      if (!iconIds.has(fromId) || !iconIds.has(toId)) continue;

      const fromSem = extractSemanticId(fromId);
      const toSem = extractSemanticId(toId);
      const label =
        arrow.props?.richText?.content?.[0]?.content?.[0]?.text ||
        arrow.props?.text ||
        "";
      edges.push({ from: fromSem, to: toSem, label: label || undefined });
    }

    // Read group metadata from text label shapes (the only source of truth for titles)
    const groupsById = new Map<string, SemanticGroup>();
    for (const child of frameChildren) {
      if (!child.meta?.isGroup) continue;
      const gId = child.meta.groupId as string;
      if (!gId) continue;

      const nextTitle = child.type === "text" ? getShapeRichTextValue(child) || "Group" : "Group";
      const existing = groupsById.get(gId);
      if (!existing) {
        groupsById.set(gId, { groupId: gId, title: nextTitle });
        continue;
      }

      if (child.type === "text" && nextTitle) {
        existing.title = nextTitle;
      }
    }

    canvasFrames.push({
      frameId: frame.id,
      frameTitle: frame.props?.name || "Diagram",
      nodes,
      edges,
      groups: Array.from(groupsById.values()),
    });
  }

  const selectedIds = Array.from(
    tldrawEditor.getSelectedShapeIds() || []
  ) as string[];
  let selectedFrameId: string | undefined;
  for (const selId of selectedIds) {
    const shape = shapeById.get(selId);
    if (!shape) continue;
    if (shape.type === "frame") {
      selectedFrameId = selId;
      break;
    }
    if (shape.parentId && !shape.parentId.startsWith("page")) {
      const parent = shapeById.get(shape.parentId);
      if (parent?.type === "frame") {
        selectedFrameId = parent.id;
        break;
      }
    }
  }

  const viewportBounds = tldrawEditor.getViewportPageBounds();
  const viewportCenter = viewportBounds
    ? {
        x: (viewportBounds.minX + viewportBounds.maxX) / 2,
        y: (viewportBounds.minY + viewportBounds.maxY) / 2,
      }
    : { x: 0, y: 0 };

  return {
    canvasGraph: { frames: canvasFrames, viewportCenter, selectedFrameId },
    semanticMap,
    framePrefixMap,
  };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useChat() {
  const activeDiagram = useDiagramStore((state) => state.activeDiagram);

  const {
    threads,
    messages,
    activeThreadId,
    isSidebarOpen,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    setSidebarOpen,
    setActiveThreadId,
    loadThreads,
    loadMessages,
    createThread,
    deleteThread,
    sendMessage: storeSendMessage,
    reset,
  } = useChatStore();

  const refreshThreads = useCallback(async () => {
    if (activeDiagram?.id) {
      await loadThreads(activeDiagram.id);
    }
  }, [activeDiagram?.id, loadThreads]);

  // ─── Main sendMessage handler ─────────────────────────────────────────────

  const handleSendMessage = useCallback(
    async (prompt: string, tldrawEditor?: any) => {
      const currentThreadId = useChatStore.getState().activeThreadId;
      if (!currentThreadId) {
        throw new Error("No active thread session is currently open");
      }

      let canvasGraph: CanvasGraph | undefined;
      let semanticMap = new Map<string, string>();
      let framePrefixMap = new Map<string, string>();

      if (tldrawEditor) {
        try {
          const built = buildCanvasGraph(tldrawEditor);
          canvasGraph = built.canvasGraph;
          semanticMap = built.semanticMap;
          framePrefixMap = built.framePrefixMap;
        } catch (err) {
          console.error("Failed to build canvas graph:", err);
        }
      }

      let result;
      try {
        result = await storeSendMessage(currentThreadId, prompt, canvasGraph as any);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send message. Please try again."
        );
        throw err;
      }

      if (result.canvasActions && tldrawEditor) {
        const actions = result.canvasActions as LLMCanvasAction;

        try {
          if (actions.action === "CREATE") {
            await handleCreate(actions as LLMCanvasActionCreate, tldrawEditor);
          } else if (actions.action === "UPDATE") {
            await handleUpdate(
              actions as LLMCanvasActionUpdate,
              tldrawEditor,
              semanticMap,
              framePrefixMap
            );
          }
        } catch (canvasErr) {
          console.error("Failed to apply AI canvas modifications:", canvasErr);
        }
      }

      return result;
    },
    [storeSendMessage]
  );

  // ─── CREATE handler ───────────────────────────────────────────────────────

  async function handleCreate(actions: LLMCanvasActionCreate, tldrawEditor: any) {
    // Guard: never create an empty frame — abort if there are no nodes to place
    if (!actions.addNodes?.length) {
      console.warn("[handleCreate] Received CREATE with no addNodes — aborting to prevent empty frame.");
      return;
    }

    const prefix = `diag_${Date.now()}_`;
    const currentShapes = tldrawEditor.getCurrentPageShapes() || [];

    // 1. Map semanticId → namespaced Tldraw ID
    const idMap = new Map<string, string>();
    for (const node of actions.addNodes || []) {
      idMap.set(node.semanticId, `${prefix}${node.semanticId}`);
    }

    // 2. Run flat Dagre (Bug #1 fix: no compound mode)
    const dagreNodes = (actions.addNodes || []).map((n) => ({
      id: idMap.get(n.semanticId)!,
      groupId: n.groupId ? `${prefix}${n.groupId}` : undefined,
    }));
    const dagreEdges = (actions.addEdges || []).map((e) => ({
      from: idMap.get(e.from) ?? e.from,
      to: idMap.get(e.to) ?? e.to,
    }));
    const dagreGroups = (actions.addGroups || []).map((g) => ({
      id: `${prefix}${g.groupId}`,
      title: g.title,
    }));

    const rawPosMap = runDagre(dagreNodes, dagreEdges);
    // Bug #1 fix: compute group bounds manually from node positions
    const rawGroupBounds = computeGroupBounds(dagreNodes, rawPosMap, dagreGroups);

    // 3. Determine spawn offset so new diagram appears below existing content
    const viewportBounds = tldrawEditor.getViewportPageBounds();
    const vpCx = viewportBounds ? (viewportBounds.minX + viewportBounds.maxX) / 2 : 0;
    const vpCy = viewportBounds ? (viewportBounds.minY + viewportBounds.maxY) / 2 : 0;

    let maxExistingY = -Infinity;
    let minExistingX = Infinity;
    let maxExistingX = -Infinity;
    for (const s of currentShapes) {
      if (s.parentId && !s.parentId.startsWith("page")) continue;
      const w = s.props?.w || ICON_SIZE;
      const h = s.props?.h || ICON_SIZE;
      if (viewportBounds) {
        if (s.y > viewportBounds.maxY || s.y + h < viewportBounds.minY) continue;
      }
      if (s.x < minExistingX) minExistingX = s.x;
      if (s.x + w > maxExistingX) maxExistingX = s.x + w;
      if (s.y + h > maxExistingY) maxExistingY = s.y + h;
    }

    let minRawX = Infinity, minRawY = Infinity, maxRawX = -Infinity;
    for (const pos of rawPosMap.values()) {
      if (pos.x < minRawX) minRawX = pos.x;
      if (pos.y < minRawY) minRawY = pos.y;
      if (pos.x > maxRawX) maxRawX = pos.x;
    }
    const layoutCx = minRawX === Infinity ? 0 : (minRawX + maxRawX) / 2;

    const offsetX =
      minExistingX !== Infinity
        ? (minExistingX + maxExistingX) / 2 - layoutCx
        : vpCx - layoutCx;
    const offsetY =
      maxExistingY > -Infinity ? maxExistingY + 160 - (minRawY ?? 0) : vpCy;

    // 4. Apply offset to get absolute positions
    const absPositions = new Map<string, { x: number; y: number }>();
    for (const [id, pos] of rawPosMap) {
      absPositions.set(id, { x: pos.x + offsetX, y: pos.y + offsetY });
    }
    const absGroupBounds = new Map<
      string,
      { x: number; y: number; width: number; height: number; title: string }
    >();
    for (const [id, gb] of rawGroupBounds) {
      absGroupBounds.set(id, { ...gb, x: gb.x + offsetX, y: gb.y + offsetY });
    }

    // 5. Frame bounding box
    let pMinX = Infinity, pMinY = Infinity, pMaxX = -Infinity, pMaxY = -Infinity;
    for (const pos of absPositions.values()) {
      if (pos.x < pMinX) pMinX = pos.x;
      if (pos.y < pMinY) pMinY = pos.y;
      if (pos.x + ICON_SIZE > pMaxX) pMaxX = pos.x + ICON_SIZE;
      if (pos.y + ICON_SIZE > pMaxY) pMaxY = pos.y + ICON_SIZE;
    }
    for (const gb of absGroupBounds.values()) {
      if (gb.x < pMinX) pMinX = gb.x;
      if (gb.y < pMinY) pMinY = gb.y;
      if (gb.x + gb.width > pMaxX) pMaxX = gb.x + gb.width;
      if (gb.y + gb.height > pMaxY) pMaxY = gb.y + gb.height;
    }
    if (pMinX === Infinity) pMinX = 0;
    if (pMinY === Infinity) pMinY = 0;
    if (pMaxX === -Infinity) pMaxX = 200;
    if (pMaxY === -Infinity) pMaxY = 200;

    const frameX = pMinX - FRAME_PADDING;
    const frameY = pMinY - FRAME_PADDING;
    const frameWidth = pMaxX - pMinX + 2 * FRAME_PADDING;
    const frameHeight = pMaxY - pMinY + 2 * FRAME_PADDING;
    const frameId = safeCreateShapeId(`frame-${Date.now()}`);

    // 6. Create frame
    tldrawEditor.createShapes([
      {
        id: frameId,
        type: "frame",
        x: frameX,
        y: frameY,
        props: {
          w: frameWidth,
          h: frameHeight,
          name: actions.frameTitle || "Architecture Flow",
        },
      },
    ]);

    // 6.5 Create group layer visuals (positions are frame-relative)
    const frameRelGroupBounds = new Map<
      string,
      { x: number; y: number; width: number; height: number; title: string }
    >();
    for (const [id, gb] of absGroupBounds) {
      frameRelGroupBounds.set(id, {
        ...gb,
        x: gb.x - frameX,
        y: gb.y - frameY,
      });
    }

    const groupShapes = buildGroupShapes(frameRelGroupBounds, frameId);
    if (groupShapes.length > 0) {
      tldrawEditor.createShapes(groupShapes);
      tldrawEditor.sendToBack(groupShapes.map((s) => s.id));
    }

    // 7. Create icon shapes (frame-relative coordinates)
    const shapesToCreate = (actions.addNodes || []).map((node) => {
      const namespacedId = idMap.get(node.semanticId)!;
      const absPos = absPositions.get(namespacedId) ?? { x: 0, y: 0 };
      return {
        id: safeCreateShapeId(namespacedId),
        parentId: frameId,
        type: "system-icon",
        x: absPos.x - frameX,
        y: absPos.y - frameY,
        props: {
          assetId: node.techType || "linux",
          label: node.label || "",
          w: ICON_SIZE,
          h: ICON_SIZE,
        },
        meta: { groupId: node.groupId ? `${prefix}${node.groupId}` : undefined },
      };
    });

    if (shapesToCreate.length > 0) {
      tldrawEditor.createShapes(shapesToCreate);
    }

    // 8. Frame-relative position map for arrow drawing
    const frameRelPosMap = new Map<string, { x: number; y: number }>();
    for (const node of actions.addNodes || []) {
      const namespacedId = idMap.get(node.semanticId)!;
      const absPos = absPositions.get(namespacedId) ?? { x: 0, y: 0 };
      frameRelPosMap.set(namespacedId, {
        x: absPos.x - frameX,
        y: absPos.y - frameY,
      });
    }

    // 9. Create arrows
    const connectionCount = new Map<string, number>();
    const edgeData = (actions.addEdges || []).map((e) => ({
      id: `${prefix}${e.semanticId}`,
      from: idMap.get(e.from) ?? e.from,
      to: idMap.get(e.to) ?? e.to,
      label: e.label,
    }));

    const { edgesToCreate, bindingsToCreate } = buildEdgeShapes(
      edgeData,
      frameRelPosMap,
      frameId,
      connectionCount
    );

    if (edgesToCreate.length > 0) tldrawEditor.createShapes(edgesToCreate);
    if (bindingsToCreate.length > 0) tldrawEditor.createBindings(bindingsToCreate);

    // 10. Group shapes into tldraw native groups by architectural layer
    const groupsMap = new Map<string, string[]>();
    for (const [namespacedGroupId, gb] of frameRelGroupBounds) {
      const geoId = safeCreateShapeId(namespacedGroupId);
      const bgId = safeCreateShapeId(`${namespacedGroupId}-bg`);
      groupsMap.set(namespacedGroupId, [geoId, bgId]);
      if (gb.title) {
        groupsMap.get(namespacedGroupId)!.push(
          safeCreateShapeId(`${namespacedGroupId}-label`)
        );
      }
    }
    for (const node of actions.addNodes || []) {
      if (node.groupId) {
        const namespacedGroupId = `${prefix}${node.groupId}`;
        const namespacedId = idMap.get(node.semanticId)!;
        if (groupsMap.has(namespacedGroupId)) {
          groupsMap.get(namespacedGroupId)!.push(safeCreateShapeId(namespacedId));
        }
      }
    }
    for (const shapeIds of groupsMap.values()) {
      if (shapeIds.length > 1) {
        tldrawEditor.groupShapes(shapeIds);
      }
    }

    // 11. Zoom to new frame
    tldrawEditor.select(frameId);
    tldrawEditor.zoomToSelection({ animation: { duration: 400 } });
  }

  // ─── UPDATE handler ───────────────────────────────────────────────────────

  /**
   * Completely rewritten handleUpdate with all 5 bugs fixed:
   *
   * Bug #2 fix: Existing node positions are read as frame-relative (they are
   *   children of the frame, so .x/.y are already relative). We never pass
   *   them to Dagre as "absolute" coordinates. Instead we only run Dagre on
   *   NEW nodes to find their relative positions to each other, then offset
   *   them to the right of the existing content.
   *
   * Bug #3 fix: Save group metadata to a local Map BEFORE calling deleteShapes.
   *
   * Bug #4 fix: Use cleanSemanticMap (system-icon only) for deletions.
   *
   * Bug #5 fix: New node positions come directly from Dagre (which gives values
   *   relative to the sub-layout's own origin) and are then offset by the
   *   rightmost point of existing content — producing correct frame-relative x/y.
   *
   * Bug #1 fix: Dagre runs without compound mode (flat layout only).
   */
  async function handleUpdate(
    actions: LLMCanvasActionUpdate,
    tldrawEditor: any,
    semanticMap: Map<string, string>,
    framePrefixMap: Map<string, string>
  ) {
    const targetFrameId = safeCreateShapeId(actions.targetFrameId);
    let currentShapes: any[] = tldrawEditor.getCurrentPageShapes() || [];

    // Validate target frame exists
    const frameShape = currentShapes.find((s: any) => s.id === targetFrameId);
    if (!frameShape) {
      console.warn(
        `[useChat] UPDATE targetFrameId="${actions.targetFrameId}" not found on canvas.`
      );
      return;
    }

    const bindingRecords: any[] = tldrawEditor.store
      .allRecords()
      .filter((r: any) => r.typeName === "binding");

    // Ungroup native tldraw groups first so we can manipulate child shapes
    const nativeGroupShapes = currentShapes.filter(
      (s: any) => s.parentId === targetFrameId && s.type === "group"
    );
    if (nativeGroupShapes.length > 0) {
      tldrawEditor.ungroupShapes(nativeGroupShapes.map((s: any) => s.id));
      currentShapes = tldrawEditor.getCurrentPageShapes() || [];
    }

    // ── Robust prefix detection (Bug fix: never fall back to a new timestamp) ────
    // Scan existing icon shapes in the target frame to extract the actual prefix.
    // Falling back to diag_${Date.now()} would generate new shape IDs, causing
    // duplicates if the LLM re-lists existing nodes in addNodes.
    let framePrefix = framePrefixMap.get(targetFrameId);
    if (!framePrefix) {
      const existingIconsForPrefix = currentShapes.filter(
        (s: any) => s.parentId === targetFrameId && s.type === "system-icon"
      );
      for (const icon of existingIconsForPrefix) {
        const stripped = icon.id.replace(/^shape:/, "");
        const m = stripped.match(/^(diag_\d+_)/);
        if (m) { framePrefix = m[1]; break; }
      }
      // Last resort — generate a new prefix only if the frame is truly empty
      if (!framePrefix) framePrefix = `diag_${Date.now()}_`;
    }

    // ── BUG #3 FIX: Save all group metadata BEFORE deleting group shapes ──────
    // We build a complete registry of (groupId → title) from the text label
    // shapes now, before they are wiped from the canvas.
    const savedGroupMeta = new Map<string, { id: string; title: string }>();
    const existingGroupShapes = currentShapes.filter(
      (s: any) => isFrameRelativeShape(s, targetFrameId) && s.meta?.isGroup
    );
    for (const g of existingGroupShapes) {
      const gId = (g.meta?.groupId as string) || g.id;
      if (savedGroupMeta.has(gId)) continue;
      const title = g.type === "text" ? getShapeRichTextValue(g) || "Group" : "Group";
      savedGroupMeta.set(gId, { id: gId, title });
    }

    // Delete ALL existing group visual shapes (they'll be redrawn after re-layout)
    if (existingGroupShapes.length > 0) {
      tldrawEditor.deleteShapes(existingGroupShapes.map((s: any) => s.id));
    }

    // ── BUG #4 FIX: Build clean semanticMap (icons only) for deletion ─────────
    // The global semanticMap can contain group shape IDs; we need icon IDs only.
    const cleanSemanticMap = new Map<string, string>();
    const allCurrentIcons = currentShapes.filter(
      (s: any) =>
        isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon"
    );
    for (const icon of allCurrentIcons) {
      cleanSemanticMap.set(extractSemanticId(icon.id), icon.id);
    }

    if (actions.deleteNodeIds?.length) {
      const toDelete = actions.deleteNodeIds
        .map((semId) => cleanSemanticMap.get(semId))
        .filter(Boolean) as string[];
      if (toDelete.length > 0) {
        tldrawEditor.deleteShapes(toDelete.map((id) => safeCreateShapeId(id)));
        // Also delete arrows connected to deleted nodes
        const deletedSet = new Set(toDelete.map((id) => safeCreateShapeId(id)));
        const connectorsToDelete = new Set<string>();

        currentShapes
          .filter((s: any) => isConnectorShape(s))
          .forEach((connector: any) => {
            const startBind = bindingRecords.find(
              (b: any) => b.fromId === connector.id && b.props?.terminal === "start"
            );
            const endBind = bindingRecords.find(
              (b: any) => b.fromId === connector.id && b.props?.terminal === "end"
            );

            const boundIds = [startBind?.toId, endBind?.toId].filter(Boolean) as string[];
            const touchesDeletedNode = boundIds.some(
              (boundId) => deletedSet.has(boundId) || deletedSet.has(safeCreateShapeId(boundId))
            );

            if (touchesDeletedNode) {
              connectorsToDelete.add(connector.id);
            }
          });

        if (connectorsToDelete.size > 0) {
          tldrawEditor.deleteShapes(Array.from(connectorsToDelete));
        }
      }
    }

    if (actions.deleteEdgeIds?.length) {
      const deleteEdgeSet = new Set(
        actions.deleteEdgeIds.map((id) => extractSemanticId(safeCreateShapeId(id)))
      );
      const edgeShapesToDelete = currentShapes
        .filter((s: any) => isConnectorShape(s))
        .filter((connector: any) => {
          const connectorSemanticId = extractSemanticId(connector.id);
          return deleteEdgeSet.has(connectorSemanticId) || deleteEdgeSet.has(connector.id);
        })
        .map((s: any) => s.id);

      if (edgeShapesToDelete.length > 0) {
        tldrawEditor.deleteShapes(edgeShapesToDelete.map((id: string) => safeCreateShapeId(id)));
      }
    }

    // Re-read shapes after all deletions
    currentShapes = tldrawEditor.getCurrentPageShapes() || [];

    // ── Build idMap (semanticId → namespacedId) ──────────────────────────────
    // Start from the full semanticMap (which has icon IDs from before the update)
    const idMap = new Map<string, string>(semanticMap);
    for (const node of actions.addNodes || []) {
      const namespacedId = `${framePrefix}${node.semanticId}`;
      idMap.set(node.semanticId, namespacedId);
    }

    // ── FRONTEND DEDUPLICATION GUARD (most reliable layer) ───────────────────
    // Directly query the Tldraw store for every icon shape that currently lives
    // in the target frame. Any node whose resolved shape ID already exists is
    // silently dropped — this prevents duplicates regardless of LLM behaviour,
    // backend validation, or frameId matching issues.
    const existingShapeIds = new Set(
      currentShapes
        .filter((s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon")
        .map((s: any) => s.id as string)
    );
    const existingSemanticIdsOnFrame = new Set(
      currentShapes
        .filter((s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon")
        .map((s: any) => extractSemanticId(s.id as string))
    );

    const dedupedAddNodes = (actions.addNodes || []).filter((node) => {
      const namespacedId = idMap.get(node.semanticId)!;
      const fullShapeId = safeCreateShapeId(namespacedId) as unknown as string;
      // Check by full namespaced shape ID (catches same-prefix duplicates)
      if (existingShapeIds.has(fullShapeId)) {
        console.warn(`[handleUpdate] Skipping duplicate node "${node.semanticId}" — shape already exists on frame.`);
        return false;
      }
      // Check by semantic ID (catches cross-prefix duplicates from prefix fallback)
      if (existingSemanticIdsOnFrame.has(node.semanticId)) {
        console.warn(`[handleUpdate] Skipping duplicate node "${node.semanticId}" — semanticId already on frame.`);
        return false;
      }
      return true;
    });

    // If LLM only sent duplicates and nothing genuinely new, redraw groups & exit
    if (dedupedAddNodes.length === 0 && !actions.addEdges?.length) {
      console.info("[handleUpdate] All nodes in addNodes were duplicates. Redrawing groups only.");
      _redrawGroupsAndResize(tldrawEditor, targetFrameId, frameShape, currentShapes, savedGroupMeta, framePrefix, actions.addGroups || []);
      return;
    }

    // ── BUG #2 + #5 FIX: Run Dagre ONLY on new nodes ─────────────────────────
    // Existing icons keep their current frame-relative positions. New nodes are
    // laid out in their own sub-graph and then placed to the right of everything.
    const newNodeDagreEntries = dedupedAddNodes.map((node) => ({
      id: idMap.get(node.semanticId)!,
      groupId: node.groupId ? `${framePrefix}${node.groupId}` : undefined,
    }));

    // For new-node Dagre: only edges where BOTH ends are new nodes matter for layout
    const newNodeIds = new Set(newNodeDagreEntries.map((n) => n.id));
    const newOnlyEdges = (actions.addEdges || [])
      .map((e) => ({
        from: idMap.get(e.from) ?? e.from,
        to: idMap.get(e.to) ?? e.to,
      }))
      .filter((e) => newNodeIds.has(e.from) && newNodeIds.has(e.to));

    let newNodePosMap = new Map<string, { x: number; y: number }>();
    if (newNodeDagreEntries.length > 0) {
      const rawNewPosMap = runDagre(newNodeDagreEntries, newOnlyEdges);

      // Find the rightmost x of existing icons (frame-relative) so we can
      // place new nodes to the right without any overlap.
      const frameBoundsBox = getShapePageBoundsBox(tldrawEditor, targetFrameId);
      const framePageX = frameBoundsBox ? frameBoundsBox.minX : 0;

      const existingDescendants = collectDescendants(currentShapes, targetFrameId);
      let rightEdge = -Infinity;
      for (const shape of existingDescendants) {
        const bounds = getShapePageBoundsBox(tldrawEditor, shape.id);
        if (bounds) {
          const relativeMaxX = bounds.maxX - framePageX;
          if (relativeMaxX > rightEdge) rightEdge = relativeMaxX;
        }
      }
      if (rightEdge === -Infinity) {
        const existingIconsNow = currentShapes.filter(
          (s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon"
        );
        for (const icon of existingIconsNow) {
          // If fallback is needed, we assume it's directly in the frame so x is relative
          const r = icon.x + ICON_SIZE;
          if (r > rightEdge) rightEdge = r;
        }
      }
      // Also account for existing group bounds from saved metadata
      // (groups extend beyond icon edges by GROUP_PADDING_X)
      // We add a full DAGRE_RANKSEP gap so there's breathing room.
      const offsetX = rightEdge > -Infinity ? rightEdge + DAGRE_RANKSEP : 0;

      // Normalise the Dagre output so its top-left starts at (0,0) then shift
      let minRawX = Infinity, minRawY = Infinity;
      for (const p of rawNewPosMap.values()) {
        if (p.x < minRawX) minRawX = p.x;
        if (p.y < minRawY) minRawY = p.y;
      }
      if (minRawX === Infinity) minRawX = 0;
      if (minRawY === Infinity) minRawY = 0;

      for (const [id, pos] of rawNewPosMap) {
        newNodePosMap.set(id, {
          x: pos.x - minRawX + offsetX,
          y: pos.y - minRawY,
        });
      }
    }

    // ── Create new icon shapes (only non-duplicate nodes) ────────────────────
    const newShapesToCreate: any[] = [];
    for (const node of dedupedAddNodes) {
      const namespacedId = idMap.get(node.semanticId)!;
      const pos = newNodePosMap.get(namespacedId) ?? { x: 100, y: 100 };
      newShapesToCreate.push({
        id: safeCreateShapeId(namespacedId),
        parentId: targetFrameId,
        type: "system-icon",
        // BUG #5 FIX: these are frame-relative coordinates (correct)
        x: pos.x,
        y: pos.y,
        props: {
          assetId: node.techType || "linux",
          label: node.label || "",
          w: ICON_SIZE,
          h: ICON_SIZE,
        },
        meta: {
          groupId: node.groupId ? `${framePrefix}${node.groupId}` : undefined,
        },
      });
    }
    if (newShapesToCreate.length > 0) {
      tldrawEditor.createShapes(newShapesToCreate);
    }

    // Re-read shapes now that new nodes are on canvas
    currentShapes = tldrawEditor.getCurrentPageShapes() || [];

    // ── Create new arrows (deduplication against existing) ────────────────────
    const allBindingsNow: any[] = tldrawEditor.store
      .allRecords()
      .filter((r: any) => r.typeName === "binding");
    const existingArrows = currentShapes.filter(
      (s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "arrow"
    );
    const connectionCount = new Map<string, number>();
    const existingEdgeKeys = new Set<string>();

    for (const arrow of existingArrows) {
      const startBind = allBindingsNow.find(
        (b: any) => b.fromId === arrow.id && b.props?.terminal === "start"
      );
      const endBind = allBindingsNow.find(
        (b: any) => b.fromId === arrow.id && b.props?.terminal === "end"
      );
      const from = startBind?.toId || arrow.props?.start?.boundShapeId || "";
      const to = endBind?.toId || arrow.props?.end?.boundShapeId || "";
      if (from && to) {
        const key = [from, to].sort().join("<->");
        connectionCount.set(key, (connectionCount.get(key) ?? 0) + 1);
        existingEdgeKeys.add(`${from}->${to}`);
      }
    }

    // Build position map for edge drawing: all icons (existing + new)
    const iconPosMap = new Map<string, { x: number; y: number }>();
    const allIconsNow = currentShapes.filter(
      (s: any) => isFrameRelativeShape(s, targetFrameId) && s.type === "system-icon"
    );
    for (const icon of allIconsNow) {
      iconPosMap.set(icon.id, { x: icon.x, y: icon.y });
    }

    const newEdgesToDraw: Array<{
      id: string;
      from: string;
      to: string;
      label?: string;
    }> = [];
    for (const edge of actions.addEdges || []) {
      const from = idMap.get(edge.from) ?? edge.from;
      const to = idMap.get(edge.to) ?? edge.to;
      const key = `${from}->${to}`;
      if (!existingEdgeKeys.has(key)) {
        newEdgesToDraw.push({
          id: `${framePrefix}${edge.semanticId}`,
          from,
          to,
          label: edge.label,
        });
        existingEdgeKeys.add(key);
      }
    }

    const { edgesToCreate, bindingsToCreate } = buildEdgeShapes(
      newEdgesToDraw,
      iconPosMap,
      targetFrameId,
      connectionCount
    );
    if (edgesToCreate.length > 0) tldrawEditor.createShapes(edgesToCreate);
    if (bindingsToCreate.length > 0) tldrawEditor.createBindings(bindingsToCreate);

    // ── Rebuild group visuals + resize frame ──────────────────────────────────
    currentShapes = tldrawEditor.getCurrentPageShapes() || [];
    _redrawGroupsAndResize(
      tldrawEditor,
      targetFrameId,
      frameShape,
      currentShapes,
      savedGroupMeta,
      framePrefix,
      actions.addGroups || []
    );

    // Zoom
    const idsToSelect =
      newShapesToCreate.length > 0
        ? newShapesToCreate.map((s) => s.id)
        : [targetFrameId];
    tldrawEditor.select(...idsToSelect);
    tldrawEditor.zoomToSelection({ animation: { duration: 400 } });
  }

  /**
   * Helper: compute group bounds from actual canvas icon positions, rebuild
   * all group visual shapes, resize the frame to contain everything, and
   * re-group shapes in native tldraw groups.
   *
   * Extracted so both the "deletions only" path and the "add nodes" path can
   * call it identically.
   */
  function _redrawGroupsAndResize(
    tldrawEditor: any,
    targetFrameId: any,
    frameShape: any,
    currentShapes: any[],
    savedGroupMeta: Map<string, { id: string; title: string }>,
    framePrefix: string,
    newGroups: Array<{ groupId: string; title: string }>
  ) {
    // Build merged group registry: existing saved + new groups from this update
    const allGroupMeta = new Map<string, { id: string; title: string }>(
      savedGroupMeta
    );
    for (const g of newGroups) {
      const namespacedId = `${framePrefix}${g.groupId}`;
      allGroupMeta.set(namespacedId, { id: namespacedId, title: g.title });
    }

    // Build the per-node position map from what's actually on canvas
    const descendantShapes = collectDescendants(currentShapes, targetFrameId);
    const iconShapes = descendantShapes.filter(
      (s: any) => s.type === "system-icon"
    );
    const nodeEntries: Array<{ id: string; groupId?: string }> = iconShapes.map(
      (s: any) => ({
        id: s.id,
        groupId: s.meta?.groupId as string | undefined,
      })
    );
    const frameBoundsBox = getShapePageBoundsBox(tldrawEditor, targetFrameId);
    const framePageX = frameBoundsBox ? frameBoundsBox.minX : 0;
    const framePageY = frameBoundsBox ? frameBoundsBox.minY : 0;

    const framePosMap = new Map<string, { x: number; y: number }>();
    for (const s of iconShapes) {
      const bounds = getShapePageBoundsBox(tldrawEditor, s.id);
      if (bounds) {
        // Convert Absolute Page coordinates back to Frame-relative coordinates
        framePosMap.set(s.id, { 
          x: bounds.minX - framePageX, 
          y: bounds.minY - framePageY 
        });
      } else {
        framePosMap.set(s.id, { x: s.x, y: s.y });
      }
    }

    // Compute group bounds from actual positions
    const groupBounds = computeGroupBounds(
      nodeEntries,
      framePosMap,
      Array.from(allGroupMeta.values())
    );

    // Create group visuals
    const groupShapes = buildGroupShapes(groupBounds, targetFrameId);
    if (groupShapes.length > 0) {
      tldrawEditor.createShapes(groupShapes);
      tldrawEditor.sendToBack(groupShapes.map((s: any) => s.id));
    }

    // Resize frame to contain all children
    const liveShapes = tldrawEditor.getCurrentPageShapes() || [];
    const allChildren = collectDescendants(liveShapes, targetFrameId);
    
    // We calculate bounds in Frame-Relative space.
    let contentBounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
    
    for (const c of allChildren) {
      const cBounds = getShapePageBoundsBox(tldrawEditor, c.id);
      if (cBounds) {
        // Convert to frame-relative
        contentBounds = expandBounds(contentBounds, {
          minX: cBounds.minX - framePageX,
          minY: cBounds.minY - framePageY,
          maxX: cBounds.maxX - framePageX,
          maxY: cBounds.maxY - framePageY,
        });
      }
    }
    // Incorporate the calculated group bounds (which are already frame-relative now)
    for (const gb of groupBounds.values()) {
      contentBounds = expandBounds(contentBounds, {
        minX: gb.x,
        minY: gb.y,
        maxX: gb.x + gb.width,
        maxY: gb.y + gb.height,
      });
    }
    if (contentBounds) {
      let shiftX = 0;
      let shiftY = 0;
      
      // If any shape is sticking out the top/left, or violating padding, calculate shift
      if (contentBounds.minX < FRAME_PADDING) {
        shiftX = FRAME_PADDING - contentBounds.minX;
      }
      if (contentBounds.minY < FRAME_PADDING) {
        shiftY = FRAME_PADDING - contentBounds.minY;
      }

      if (shiftX > 0 || shiftY > 0) {
        // Shift all direct children of the frame to push them into positive space
        const directChildren = liveShapes.filter((s: any) => s.parentId === targetFrameId);
        tldrawEditor.updateShapes(
          directChildren.map((s: any) => ({
            id: s.id,
            type: s.type,
            x: s.x + shiftX,
            y: s.y + shiftY,
          }))
        );
        
        // Adjust bounds so the frame resizes around the new shifted positions
        contentBounds.maxX += shiftX;
        contentBounds.maxY += shiftY;
      }

      tldrawEditor.updateShape({
        id: targetFrameId,
        props: {
          w: Math.max(200, contentBounds.maxX + FRAME_PADDING),
          h: Math.max(200, contentBounds.maxY + FRAME_PADDING),
        },
      });
    }

    // Re-create native tldraw groups so layer members move together
    const groupsMap = new Map<string, string[]>();
    for (const [namespacedGroupId, gb] of groupBounds) {
      const geoId = safeCreateShapeId(namespacedGroupId);
      const bgId = safeCreateShapeId(`${namespacedGroupId}-bg`);
      groupsMap.set(namespacedGroupId, [geoId, bgId]);
      if (gb.title) {
        groupsMap
          .get(namespacedGroupId)!
          .push(safeCreateShapeId(`${namespacedGroupId}-label`));
      }
    }
    for (const icon of iconShapes) {
      const gId = icon.meta?.groupId as string | undefined;
      if (gId && groupsMap.has(gId)) {
        groupsMap.get(gId)!.push(icon.id);
      }
    }
    for (const shapeIds of groupsMap.values()) {
      if (shapeIds.length > 1) {
        tldrawEditor.groupShapes(shapeIds);
      }
    }
  }

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    threads,
    messages,
    activeThreadId,
    isSidebarOpen,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    activeDiagramId: activeDiagram?.id || null,

    setSidebarOpen,
    setActiveThreadId,
    refreshThreads,
    loadMessages,
    createThread: useCallback(
      (title: string) => {
        if (!activeDiagram?.id) throw new Error("No active diagram");
        return createThread(activeDiagram.id, title);
      },
      [activeDiagram?.id, createThread]
    ),
    deleteThread,
    sendMessage: handleSendMessage,
    reset,
  };
}
