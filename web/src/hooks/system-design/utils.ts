import { createShapeId } from "tldraw";

/** Prevent double-prefixing of shape IDs */
export const safeCreateShapeId = (id: string) => {
  if (id.startsWith("shape:")) return id as any;
  return createShapeId(id);
};

/**
 * Extract the semantic ID from a full Tldraw shape ID.
 * e.g. "shape:diag_1716300000_nodejs-server" → "nodejs-server"
 * Falls back to stripping only the "shape:" prefix if no diag_ prefix found.
 */
export const extractSemanticId = (tldrawId: string): string => {
  const withoutPrefix = tldrawId.replace(/^shape:/, "");
  const diagMatch = withoutPrefix.match(/^diag_\d+_(.+)$/);
  if (diagMatch) return diagMatch[1];
  return withoutPrefix;
};

export const getShapeRichTextValue = (shape: any): string => {
  return (
    shape?.props?.richText?.content?.[0]?.content?.[0]?.text ||
    shape?.props?.text ||
    shape?.props?.title ||
    ""
  );
};

export const isFrameRelativeShape = (shape: any, frameId: string) => {
  return shape?.parentId === frameId;
};

export const isConnectorShape = (shape: any) => {
  return shape?.type === "arrow" || shape?.type === "line";
};

export const estimateTextWidth = (text: string, fontSize = 12) => {
  const cleanText = (text || "").trim();
  const lines = cleanText.split(/\n+/);
  const longestLine = lines.reduce((longest, line) => Math.max(longest, line.length), 0);
  return Math.max(120, Math.min(560, Math.ceil(longestLine * fontSize * 0.62) + 32));
};

export const estimateTextHeight = (text: string, fontSize = 12) => {
  const cleanText = (text || "").trim();
  const lines = cleanText ? cleanText.split(/\n+/).length : 1;
  return Math.max(24, Math.ceil(lines * fontSize * 1.4) + 12);
};

export const collectDescendants = (shapes: any[], parentId: string) => {
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

export const resolveRelativePositionToFrame = (
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

export const getShapePageBoundsBox = (editor: any, shapeId: string) => {
  const bounds = editor?.getShapePageBounds?.(shapeId);
  if (!bounds) return null;

  return {
    minX: bounds.minX,
    minY: bounds.minY,
    maxX: bounds.maxX,
    maxY: bounds.maxY,
  };
};

export const expandBounds = (
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
