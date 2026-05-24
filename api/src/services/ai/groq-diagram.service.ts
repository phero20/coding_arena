import { type ICradle } from "../../libs/awilix-container";
import { type GroqLlmService } from "./groq-llm.service";
import { type GeminiLlmService } from "./gemini-llm.service";
import { type IDiagramResolverService } from "./diagram-resolver.service";
import type { CanvasGraph, CanvasFrame, SemanticNode } from "../../validators/chat.validator";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("groq-diagram.service");

// ─── LLM response types ──────────────────────────────────────────────────────

interface LLMNewNode {
  semanticId: string;
  techType: string;
  label: string;
  groupId?: string;
}

interface LLMCanvasGroup {
  groupId: string;
  title: string;
}

interface LLMNewEdge {
  semanticId: string;
  from: string;
  to: string;
  label?: string;
}

interface LLMCanvasActionCreate {
  action: "CREATE";
  frameTitle: string;
  addGroups?: LLMCanvasGroup[];
  addNodes: LLMNewNode[];
  addEdges: LLMNewEdge[];
}

interface LLMCanvasActionUpdate {
  action: "UPDATE";
  targetFrameId: string;
  addGroups?: LLMCanvasGroup[];
  addNodes?: LLMNewNode[];
  addEdges?: LLMNewEdge[];
  deleteNodeIds?: string[];
  deleteEdgeIds?: string[];
}

interface LLMCanvasActionNone {
  action: "NONE";
}

type LLMCanvasAction = LLMCanvasActionCreate | LLMCanvasActionUpdate | LLMCanvasActionNone;

interface LLMResponse {
  textResponse: string;
  canvasActions: LLMCanvasAction;
}

// ─── Service interface ───────────────────────────────────────────────────────

export interface IGroqDiagramService {
  generateDiagram(
    prompt: string,
    pastMessages: Array<{ role: "user" | "assistant"; content: string }>,
    canvasGraph?: CanvasGraph
  ): Promise<{ textResponse: string; canvasActions: LLMCanvasAction }>;
}

// ─── Service implementation ──────────────────────────────────────────────────

export class GroqDiagramService implements IGroqDiagramService {
  private readonly llmService: GroqLlmService;
  private readonly geminiLlmService: GeminiLlmService;
  private readonly diagramResolverService: IDiagramResolverService;

  constructor({ groqLlmService, geminiLlmService, diagramResolverService }: ICradle) {
    this.llmService = groqLlmService;
    this.geminiLlmService = geminiLlmService;
    this.diagramResolverService = diagramResolverService;
  }

  async generateDiagram(
    prompt: string,
    pastMessages: Array<{ role: "user" | "assistant"; content: string }>,
    canvasGraph?: CanvasGraph
  ): Promise<{ textResponse: string; canvasActions: LLMCanvasAction }> {

    // ── 1. Build the frame-grouped canvas context string ──────────────────────
    let canvasContext = "The canvas is currently empty.\n";

    if (canvasGraph?.frames && canvasGraph.frames.length > 0) {
      canvasContext = `The canvas has ${canvasGraph.frames.length} diagram frame(s):\n\n`;

      canvasGraph.frames.forEach((frame, idx) => {
        canvasContext += `--- Frame ${idx + 1} ---\n`;
        canvasContext += `frameId: "${frame.frameId}"\n`;
        canvasContext += `Title: "${frame.frameTitle}"\n`;

        // Token Saver: Omit full details for non-active frames
        if (canvasGraph.selectedFrameId && frame.frameId !== canvasGraph.selectedFrameId) {
          canvasContext += `[Nodes and Edges omitted. This frame is currently NOT selected or active.]\n\n`;
          return;
        }

        canvasContext += `Nodes (${frame.nodes.length}):\n`;

        if (frame.nodes.length === 0) {
          canvasContext += `  (none)\n`;
        } else {
          frame.nodes.forEach((node) => {
            canvasContext += `  - semanticId: "${node.semanticId}", techType: "${node.techType}", label: "${node.label}"\n`;
          });
        }

        canvasContext += `Edges (${frame.edges.length}):\n`;
        if (frame.edges.length === 0) {
          canvasContext += `  (none)\n`;
        } else {
          frame.edges.forEach((edge) => {
            canvasContext += `  - from: "${edge.from}" → to: "${edge.to}"${edge.label ? `, label: "${edge.label}"` : ""}\n`;
          });
        }
        canvasContext += "\n";
      });

      if (canvasGraph.selectedFrameId) {
        const selectedFrame = canvasGraph.frames.find(
          (f) => f.frameId === canvasGraph.selectedFrameId
        );
        if (selectedFrame) {
          canvasContext += `The user currently has Frame "${selectedFrame.frameTitle}" (frameId: "${selectedFrame.frameId}") selected.\n`;
        }
      }
    }

    // ── 3. Build system prompt ─────────────────────────────────────────────────
    const systemPrompt = `You are a Principal Cloud Architect and System Design Expert with decades of experience at top-tier tech companies. Your task is to design production-ready, highly scalable, and secure system architectures based on user requirements and render them onto an infinite canvas.

### CORE OBJECTIVES
1. Think deeply about scalability, fault tolerance, security, and performance. Do not just draw simple boxes; represent real-world enterprise architectures with load balancers, caching layers, message brokers, distinct microservices, and specialized databases.
2. Structure the architecture visually using logical "Architectural Layers" (Compound Graph Groups).
3. Ensure the flow of dependencies strictly follows the request lifecycle (from client to server to storage) so the layout engine can render a beautiful left-to-right diagram.

### RESPONSE FORMAT
Return a SINGLE JSON object — NO markdown code blocks, NO conversational text, NO extra keys:
{
  "textResponse": "A highly professional, detailed explanation of the architecture decisions made.",
  "canvasActions": { ... one of the three action shapes below ... }
}

### HOW TO CHOOSE THE CORRECT ACTION — READ THIS CAREFULLY
- Use CREATE only when the user asks to design something that does NOT exist on the canvas at all.
- Use UPDATE when the user refers to ANY existing diagram (using words like "it", "the diagram", "this", "that", "add to", "remove from", "replace", "change", "modify", "delete", "redo", etc.). NEVER use CREATE to "redo" or make a revised copy of an existing diagram.
- If the canvas already has a matching diagram and the user says to change it, you MUST use UPDATE.

### ACTION: CREATE (ONLY for brand-new diagrams not on canvas)
{
  "textResponse": "Detailed explanation of the new architecture...",
  "canvasActions": {
    "action": "CREATE",
    "frameTitle": "The overall architecture title (e.g., Global Netflix Streaming Architecture)",
    "addGroups": [
      { "groupId": "layer-edge", "title": "Edge & CDN Layer" },
      { "groupId": "layer-gateway", "title": "API Gateway & Load Balancing" },
      { "groupId": "layer-compute", "title": "Microservices & Compute Layer" },
      { "groupId": "layer-events", "title": "Event Streaming & Async Processing" },
      { "groupId": "layer-storage", "title": "Data & Storage Layer" }
    ],
    "addNodes": [
      { "semanticId": "unique-kebab-id", "techType": "technology-name", "label": "Display Label", "groupId": "layer-gateway" }
    ],
    "addEdges": [
      { "semanticId": "unique-edge-id", "from": "semanticId-of-source", "to": "semanticId-of-target", "label": "Protocol or relationship" }
    ]
  }
}
- semanticId MUST be unique, lowercase, kebab-case, 2-30 chars, e.g. "nginx-gateway", "postgres-db", "redis-cache"
- techType MUST be a lowercase industry name, e.g. "nginx", "redis", "postgresql", "nodejs", "react", "lambda", "s3"
- Every node in addNodes MUST have at least one edge in addEdges connecting it to another node
- DO NOT reference any existing canvas frameIds or semanticIds in a CREATE action
- DO NOT return CREATE with an empty addNodes array — if you have nothing to create, use NONE

### ACTION: UPDATE (modify an existing diagram on the canvas)
{
  "textResponse": "Explanation of the modifications made...",
  "canvasActions": {
    "action": "UPDATE",
    "targetFrameId": "<exact frameId string from the canvas state above>",
    "addGroups": [ ... optionally add new layer groups (only if adding nodes that need a new group) ... ],
    "addNodes": [
      IMPORTANT — addNodes must contain ONLY brand-new nodes being added for the first time.
      DO NOT include any nodes that already exist in the canvas state for this frame.
      If you want to add Redis and the existing nodes are nginx, nodejs, postgres — addNodes should contain ONLY Redis.
      { "semanticId": "redis-cache", "techType": "redis", "label": "Redis Cache", "groupId": "layer-storage" }
    ],
    "addEdges": [
      Both "from" and "to" can be either an existing semanticId OR a new node's semanticId from addNodes.
      { "semanticId": "unique-edge-id", "from": "existing-or-new-semanticId", "to": "existing-or-new-semanticId", "label": "Cache Hit" }
    ],
    "deleteNodeIds": ["exact-semanticId-from-canvas-state-to-delete"],
    "deleteEdgeIds": []
  }
}
- targetFrameId MUST be an exact frameId value from the canvas state — copy it character-for-character
- addNodes contains ONLY NEW nodes — NEVER re-include a node that already appears in the canvas state node list
- In addEdges, both "from" and "to" MUST be either an existing semanticId OR a new semanticId from addNodes in this response
- deleteNodeIds contains semanticIds of nodes TO REMOVE — copy them exactly from the canvas state
- All arrays are optional — only include what is actually changing

### ACTION: NONE (no canvas changes needed)
{ 
  "textResponse": "Explanation of why no changes were made...",
  "canvasActions": { "action": "NONE" } 
}

### STRICT RULES — NEVER VIOLATE
1. NO ORPHANED NODES: Every node in addNodes MUST be connected by at least one edge in addEdges.
2. UPDATE ONLY DELTA: In UPDATE, addNodes contains ONLY new nodes. Never re-list nodes that already exist on the frame.
3. CREATE UNIQUENESS: In CREATE, never reuse any existing canvas frameId or semanticId.
4. NEVER EMPTY CREATE: Do not return CREATE with an empty addNodes array. Use NONE instead.
5. VALID TECH TYPES: Use only lowercase tech names like "nginx", "redis", "postgresql", "nodejs", "react", "kafka", "docker", "kubernetes", "aws-lambda", "aws-s3", "aws-sqs", "rabbitmq", "mongodb", "mysql", "elasticsearch", "cassandra", "graphql".
6. EXPERT ARCHITECTURE: Generate realistic, highly-available, industry-standard topologies. Do NOT connect everything in a single sequential straight line. Use fan-out and fan-in patterns.
7. EDGE DIRECTION (CRITICAL FOR LAYOUT): Arrows must represent Request or Dependency flow, NOT Data flow. Frontends/proxies on the left, databases/storage on the right.
8. COMPREHENSIVE ARCHITECTURAL LAYERS: Categorize ALL components into logical layers using addGroups. Assign EVERY node to a group. Standard layers: "Client Devices", "CDN & Edge", "API Gateway / Load Balancer", "Compute / Microservices", "Async Workers", "Data & Storage Layer".`;


    // ── 4. Build user prompt ───────────────────────────────────────────────────
    const userPrompt = `### CONVERSATION HISTORY:
${pastMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

### CURRENT CANVAS STATE:
${canvasContext}

### USER REQUEST:
"${prompt}"

Respond with the JSON object now.`;

    // ── 5. Call LLM (With Circuit Breaker Fallback) ───────────────────────────
    let response: any;
    
    try {
      response = await this.llmService.generateJson<LLMResponse>({
        systemPrompt,
        userPrompt,
        temperature: 0.1,
      });
    } catch (err: any) {
      logger.warn({ err: err.message }, "Groq API failed or Circuit Breaker is OPEN. Falling back to Gemini 2.0 Flash.");
      
      try {
        response = await this.geminiLlmService.generateJson<LLMResponse>({
          systemPrompt,
          userPrompt,
          temperature: 0.1,
        });
      } catch (geminiErr: any) {
        logger.error({ err: geminiErr.message }, "Gemini Fallback ALSO failed. All AI models are currently down.");
        
        // Graceful Degradation Response
        return {
          textResponse: "All AI systems are currently under heavy load or unavailable. Please try again in 60 seconds.",
          canvasActions: { action: "NONE" },
        };
      }
    }


    // ── 6. Post-process & validate ────────────────────────────────────────────
    let parsed = response.data as any;

    // Recover from LLM failing to wrap the response in 'canvasActions'
    if (!parsed?.canvasActions && parsed?.action) {
      logger.warn("LLM returned flat JSON without canvasActions wrapper. Auto-recovering.");
      parsed = {
        textResponse: parsed.textResponse || "Architecture updated.",
        canvasActions: { ...parsed }
      };
      // Delete redundant textResponse from inside canvasActions to keep it clean
      delete parsed.canvasActions.textResponse;
    }

    if (!parsed?.canvasActions) {
      logger.warn("LLM response missing canvasActions entirely. Falling back to NONE.");
      return {
        textResponse: parsed?.textResponse || "Done.",
        canvasActions: { action: "NONE" },
      };
    }

    const ca = parsed.canvasActions;

    if (ca.action === "CREATE" || ca.action === "UPDATE") {
      // 6a. Resolve techType → canonical asset ID via DiagramResolverService
      const nodes = (ca as any).addNodes as LLMNewNode[] | undefined;
      if (nodes && Array.isArray(nodes)) {
        for (const node of nodes) {
          node.techType = await this.diagramResolverService.resolveIconId(node.techType);
          // Ensure semanticId is clean kebab
          node.semanticId = node.semanticId
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
      }

      // 6b. For UPDATE: validate targetFrameId, strip duplicate nodes, strip invalid edges
      if (ca.action === "UPDATE") {
        const updateAction = ca as LLMCanvasActionUpdate;

        // Resolve the target frame
        const targetFrame = canvasGraph?.frames.find(
          (f) => f.frameId === updateAction.targetFrameId
        );

        // If targetFrameId is hallucinated, do not mutate a different frame.
        if (!targetFrame && canvasGraph?.frames && canvasGraph.frames.length > 0) {
          logger.warn(
            { targetFrameId: updateAction.targetFrameId },
            "LLM returned unknown targetFrameId — returning NONE to avoid mutating the wrong frame"
          );
          return {
            textResponse: `${parsed.textResponse || "Done."} Warning: I could not identify the requested diagram frame, so no canvas changes were applied.`,
            canvasActions: { action: "NONE" },
          };
        }

        const resolvedFrame = canvasGraph?.frames.find(
          (f) => f.frameId === updateAction.targetFrameId
        );
        const existingSemanticIds = new Set(
          resolvedFrame?.nodes.map((n) => n.semanticId) ?? []
        );

        // DEDUPLICATION FIX: Strip any nodes from addNodes that already exist on the frame.
        // The LLM sometimes re-lists all nodes when the prompt says "add X" — we remove them here
        // so the frontend never creates duplicate shapes.
        if (updateAction.addNodes?.length) {
          const before = updateAction.addNodes.length;
          updateAction.addNodes = updateAction.addNodes.filter((node) => {
            if (existingSemanticIds.has(node.semanticId)) {
              logger.warn(
                { semanticId: node.semanticId },
                "Stripping duplicate node from UPDATE.addNodes — already exists on frame"
              );
              return false;
            }
            return true;
          });
          if (updateAction.addNodes.length !== before) {
            logger.info(
              { stripped: before - updateAction.addNodes.length },
              "Removed duplicate existing nodes from LLM UPDATE response"
            );
          }
        }

        // Build valid ID set: remaining new nodes + existing nodes
        const newSemanticIds = (updateAction.addNodes || []).map((n) => n.semanticId);
        const allValidIds = new Set(Array.from(existingSemanticIds).concat(newSemanticIds));

        // Strip any edges that reference semanticIds we don't know about
        if (updateAction.addEdges) {
          updateAction.addEdges = updateAction.addEdges.filter((edge) => {
            const fromOk = allValidIds.has(edge.from);
            const toOk = allValidIds.has(edge.to);
            if (!fromOk || !toOk) {
              logger.warn(
                { edgeFrom: edge.from, edgeTo: edge.to },
                "Dropping invalid edge: unknown semanticId(s)"
              );
            }
            return fromOk && toOk;
          });
        }

        // Strip deleteNodeIds that don't exist on the frame (LLM hallucination)
        if (updateAction.deleteNodeIds?.length) {
          updateAction.deleteNodeIds = updateAction.deleteNodeIds.filter((semId) => {
            if (!existingSemanticIds.has(semId)) {
              logger.warn({ semId }, "Dropping deleteNodeId — not found in target frame");
              return false;
            }
            return true;
          });
        }
      }

      // 6c. For CREATE: ensure addEdges only references semanticIds from addNodes
      if (ca.action === "CREATE") {
        const createAction = ca as LLMCanvasActionCreate;
        const newIds = new Set(createAction.addNodes.map((n) => n.semanticId));
        createAction.addEdges = (createAction.addEdges || []).filter((edge) => {
          const valid = newIds.has(edge.from) && newIds.has(edge.to);
          if (!valid) {
            logger.warn(
              { edgeFrom: edge.from, edgeTo: edge.to },
              "Dropping CREATE edge referencing unknown semanticId"
            );
          }
          return valid;
        });
      }
    }

    return {
      textResponse: parsed.textResponse || "Done.",
      canvasActions: parsed.canvasActions,
    };
  }
}
