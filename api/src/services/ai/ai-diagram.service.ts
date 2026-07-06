import { type ICradle } from "../../libs/awilix-container";
import { type UnifiedLlmService } from "./unified-llm.service";
import { type IDiagramResolverService } from "./diagram-resolver.service";
import { AI_DIAGRAM_SYSTEM_PROMPT, buildAiDiagramUserPrompt } from "../../libs/prompts/ai-diagram.prompt";
import type { CanvasGraph, CanvasFrame, SemanticNode } from "../../validators/chat.validator";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("ai-diagram.service");

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

export interface IAiDiagramService {
  generateDiagram(
    prompt: string,
    pastMessages: Array<{ role: "user" | "assistant"; content: string }>,
    canvasGraph?: CanvasGraph
  ): Promise<{ textResponse: string; canvasActions: LLMCanvasAction }>;
}

// ─── Service implementation ──────────────────────────────────────────────────

export class AiDiagramService implements IAiDiagramService {
  private readonly unifiedLlmService: UnifiedLlmService;
  private readonly diagramResolverService: IDiagramResolverService;

  constructor({ unifiedLlmService, diagramResolverService }: ICradle) {
    this.unifiedLlmService = unifiedLlmService;
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
    const systemPrompt = AI_DIAGRAM_SYSTEM_PROMPT;

    // ── 4. Build user prompt ───────────────────────────────────────────────────
    const userPrompt = buildAiDiagramUserPrompt(pastMessages, canvasContext, prompt);

    // ── 5. Call LLM (With Circuit Breaker Fallback) ───────────────────────────
    let response: any;
    
    try {
      response = await this.unifiedLlmService.generateJson<LLMResponse>({
        systemPrompt,
        userPrompt,
        temperature: 0.1,
        order: "order2",
        maxTokens: 5000,
      });
    } catch (err: any) {
      logger.error({ err: err.message }, "All AI models are currently down.");
      
      // Graceful Degradation Response
      return {
        textResponse: "All AI systems are currently under load or unavailable. Please try again in 60 seconds.",
        canvasActions: { action: "NONE" } as LLMCanvasActionNone,
      };
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
