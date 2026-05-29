import { z } from "zod";

export const createChatThreadSchema = z.object({
  diagramId: z.string().uuid("Invalid diagram ID format"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

// ─── Semantic Graph schemas (new) ────────────────────────────────────────────

export const semanticNodeSchema = z.object({
  semanticId: z.string(),
  techType: z.string(),
  label: z.string(),
  groupId: z.string().optional(),
});

export const semanticEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});

export const semanticGroupSchema = z.object({
  groupId: z.string(),
  title: z.string(),
});

export const canvasFrameSchema = z.object({
  frameId: z.string(),
  frameTitle: z.string(),
  nodes: z.array(semanticNodeSchema),
  edges: z.array(semanticEdgeSchema),
  groups: z.array(semanticGroupSchema).optional(),
});

export const canvasGraphSchema = z.object({
  frames: z.array(canvasFrameSchema),
  viewportCenter: z.object({ x: z.number(), y: z.number() }).optional(),
  selectedFrameId: z.string().optional(),
});

// ─── Message input ───────────────────────────────────────────────────────────

export const createChatMessageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(2000, "Prompt is too long"),
  canvasGraph: canvasGraphSchema.optional(),
  // legacy fallback field name — ignored if canvasGraph is present
  canvasState: z.any().optional(),
  diagramId: z.string().uuid("Invalid diagram ID format").optional(),
});

export type CreateChatThreadInput = z.infer<typeof createChatThreadSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type CanvasGraph = z.infer<typeof canvasGraphSchema>;
export type CanvasFrame = z.infer<typeof canvasFrameSchema>;
export type SemanticNode = z.infer<typeof semanticNodeSchema>;
export type SemanticEdge = z.infer<typeof semanticEdgeSchema>;
export type SemanticGroup = z.infer<typeof semanticGroupSchema>;
