import type { CanvasGraph, CanvasFrame, SemanticNode, SemanticEdge, SemanticGroup } from "@/types/chat";
import { collectDescendants, extractSemanticId, getShapeRichTextValue } from "./utils";

export function getActiveFrameInfo(tldrawEditor: any): { id: string; title: string } | null {
  if (!tldrawEditor) return null;
  const allShapes = tldrawEditor.getCurrentPageShapes() || [];
  const frames = allShapes.filter((s: any) => s.type === "frame");
  if (frames.length === 0) return null;

  const shapeById = new Map<string, any>();
  for (const s of allShapes) shapeById.set(s.id, s);

  const vp = tldrawEditor.getViewportPageBounds();

  // 1. Check selection (climb tree), BUT only if the selected shape is actually visible!
  const selectedIds = Array.from(tldrawEditor.getSelectedShapeIds() || []) as string[];
  for (const selId of selectedIds) {
    // Determine if selected shape is in viewport
    let isVisible = true;
    const bounds = tldrawEditor.getShapePageBounds(selId);
    if (bounds && vp) {
      if (
        bounds.maxX < vp.minX ||
        bounds.minX > vp.maxX ||
        bounds.maxY < vp.minY ||
        bounds.minY > vp.maxY
      ) {
        isVisible = false;
      }
    }

    if (isVisible) {
      let current = shapeById.get(selId);
      while (current && !current.id.startsWith("page")) {
        if (current.type === "frame") {
          return { id: current.id, title: current.props?.name || "Diagram" };
        }
        current = shapeById.get(current.parentId);
      }
    }
  }

  // 2. Fallback to viewport bounds intersection
  if (vp) {
    let bestFrame: any = null;
    let maxArea = 0;
    for (const frame of frames) {
      const bounds = tldrawEditor.getShapePageBounds(frame.id);
      if (!bounds) continue;
      
      const minX = Math.max(vp.minX, bounds.minX);
      const maxX = Math.min(vp.maxX, bounds.maxX);
      const minY = Math.max(vp.minY, bounds.minY);
      const maxY = Math.min(vp.maxY, bounds.maxY);
      
      if (maxX > minX && maxY > minY) {
        const area = (maxX - minX) * (maxY - minY);
        if (area > maxArea) {
          maxArea = area;
          bestFrame = frame;
        }
      }
    }
    if (bestFrame) {
      return { id: bestFrame.id, title: bestFrame.props?.name || "Diagram" };
    }
  }

  return null;
}

/**
 * Build the canvasGraph from the current tldraw page.
 *
 * BUG #6 FIX: Only "system-icon" shapes are reported as semantic nodes.
 * Group visual shapes (geo rectangles + text labels) are NOT nodes — sending
 * them to the LLM as nodes caused hallucinated "geo-rectangle" nodes, corrupted
 * semanticIds, and broken edge references.
 */
export function buildCanvasGraph(tldrawEditor: any): {
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

  const localCollectDescendants = (parentId: string): any[] => {
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
    const frameChildren = localCollectDescendants(frame.id).filter(
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

      if (!framePrefix) {
        const stripped = child.id.replace(/^shape:/, "");
        const m = stripped.match(/^(diag_\d+_)/);
        if (m) framePrefix = m[1];
      }

      semanticMap.set(semId, child.id);

      nodes.push({
        semanticId: semId,
        techType: techType,
        label,
        groupId: groupId ? extractSemanticId(groupId) : undefined,
      });
    }

    if (framePrefix) {
      framePrefixMap.set(frame.id, framePrefix);
    }

    const allArrows = allShapes.filter((s: any) => s.type === "arrow");
    const bindings = tldrawEditor.store
      .allRecords()
      .filter((r: any) => r.typeName === "binding");

    const edges: SemanticEdge[] = [];
    for (const arrow of allArrows) {
      const startBinding = bindings.find(
        (b: any) => b.fromId === arrow.id && b.props?.terminal === "start"
      );
      const endBinding = bindings.find(
        (b: any) => b.fromId === arrow.id && b.props?.terminal === "end"
      );

      if (!startBinding?.toId || !endBinding?.toId) continue;

      const fromShape = shapeById.get(startBinding.toId);
      const toShape = shapeById.get(endBinding.toId);
      if (!fromShape || !toShape) continue;
      
      if (fromShape.parentId !== frame.id && toShape.parentId !== frame.id) {
         let fromParent = fromShape.parentId;
         let fromInFrame = false;
         while(fromParent && fromParent !== "page") {
             if (fromParent === frame.id) { fromInFrame = true; break; }
             fromParent = shapeById.get(fromParent)?.parentId;
         }
         let toParent = toShape.parentId;
         let toInFrame = false;
         while(toParent && toParent !== "page") {
             if (toParent === frame.id) { toInFrame = true; break; }
             toParent = shapeById.get(toParent)?.parentId;
         }
         if (!fromInFrame && !toInFrame) continue;
      }

      const fromSem = extractSemanticId(startBinding.toId);
      const toSem = extractSemanticId(endBinding.toId);
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

  const activeFrame = getActiveFrameInfo(tldrawEditor);
  const selectedFrameId = activeFrame?.id;

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
