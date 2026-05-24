// ─── Chat thread & message models ───────────────────────────────────────────

export interface ChatThread {
  id: string;
  diagramId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// ─── Semantic Graph — what we send to the LLM ───────────────────────────────

/**
 * A single node in a diagram frame.
 * semanticId is the stable short ID (e.g. "nodejs-server"), stripped of the
 * Tldraw "shape:diag_TIMESTAMP_" prefix. It is deterministically reversible.
 */
export interface SemanticNode {
  semanticId: string;    // e.g. "nodejs-server"
  techType: string;      // resolved asset id, e.g. "nodejs", "redis", "postgresql"
  label: string;         // display label
  groupId?: string;      // optional architectural layer id
}

/**
 * A directed edge between two nodes, using semanticIds.
 */
export interface SemanticEdge {
  from: string;          // semanticId of source node
  to: string;            // semanticId of target node
  label?: string;
}

export interface SemanticGroup {
  groupId: string;
  title: string;
}

/**
 * One diagram frame on the infinite canvas, with all its nodes and edges.
 */
export interface CanvasFrame {
  frameId: string;       // full Tldraw shape ID e.g. "shape:frame-1716300000"
  frameTitle: string;
  nodes: SemanticNode[];
  edges: SemanticEdge[];
  groups?: SemanticGroup[];
}

/**
 * The full structured canvas graph sent to the API with each message.
 * Contains all frames on the current page plus viewport info.
 */
export interface CanvasGraph {
  frames: CanvasFrame[];
  viewportCenter?: { x: number; y: number };
  selectedFrameId?: string;   // frame that is currently selected or most recently interacted
}

// ─── LLM Response Actions ────────────────────────────────────────────────────

/**
 * A node to be added by the LLM.
 * The LLM picks the semanticId (clean, short, lowercase-kebab).
 * The frontend will namespace it into a full Tldraw ID.
 */
export interface LLMCanvasGroup {
  groupId: string;
  title: string;
}

export interface LLMNewNode {
  semanticId: string;   // e.g. "redis-cache"
  techType: string;     // e.g. "redis"
  label: string;
  groupId?: string;
}

/**
 * An edge to add, referencing semanticIds only.
 * Both `from` and `to` must reference EITHER an existing node's semanticId
 * (from the canvas state) OR a new node's semanticId (from addNodes in this response).
 */
export interface LLMNewEdge {
  semanticId: string;   // unique id for this edge, e.g. "edge-redis-node"
  from: string;         // semanticId
  to: string;           // semanticId
  label?: string;
}

export interface LLMCanvasActionCreate {
  action: "CREATE";
  frameTitle: string;
  addGroups?: LLMCanvasGroup[];
  addNodes: LLMNewNode[];
  addEdges: LLMNewEdge[];
}

export interface LLMCanvasActionUpdate {
  action: "UPDATE";
  targetFrameId: string;   // exact full Tldraw frame ID from the canvas state
  addGroups?: LLMCanvasGroup[];
  addNodes?: LLMNewNode[];
  addEdges?: LLMNewEdge[];
  deleteNodeIds?: string[]; // semanticIds of nodes to delete
  deleteEdgeIds?: string[]; // semanticIds of edges to delete
}

export interface LLMCanvasActionNone {
  action: "NONE";
}

export type LLMCanvasAction =
  | LLMCanvasActionCreate
  | LLMCanvasActionUpdate
  | LLMCanvasActionNone;

// ─── API Request / Response shapes ──────────────────────────────────────────

export interface CreateChatThreadInput {
  diagramId: string;
  title: string;
}

export interface CreateChatMessageInput {
  prompt: string;
  canvasGraph?: CanvasGraph;
  diagramId?: string;
}

export interface SendMessageResponse {
  textResponse: string;
  canvasActions?: LLMCanvasAction;
  thread?: ChatThread;
}

// ─── Legacy aliases kept for backward compat (can remove later) ──────────────
/** @deprecated Use CanvasGraph */
export type CanvasState = CanvasGraph;
/** @deprecated Use LLMCanvasAction */
export type CanvasActions = LLMCanvasAction;
