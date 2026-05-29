import { createLogger } from "../../libs/utils/logger";
import { redis } from "../../libs/core/redis";
import type {
  IWorkspaceService,
  WorkspaceService,
} from "../../services/workspace/workspace.service";
import type { Workspace, Diagram } from "../../db/schema";
import {
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
  type CreateDiagramInput,
  type UpdateDiagramInput,
} from "../../validators/workspace.validator";
import { type ICradle } from "../../libs/awilix-container";

const logger = createLogger("workspace-cache");

/**
 * WorkspaceCache Decorator.
 * Implements IWorkspaceService to provide a high-performance Redis caching layer for workspaces and system design diagrams.
 */
export class WorkspaceCache implements IWorkspaceService {
  private readonly CACHE_TTL = 7200; // 2 hours
  private readonly rawWorkspaceService: WorkspaceService;

  constructor({ rawWorkspaceService }: ICradle) {
    this.rawWorkspaceService = rawWorkspaceService;
  }

  // Helper to invalidate all workspace related cache keys for a user or workspace
  private async invalidateWorkspaceCache(userId: string, workspaceId?: string): Promise<void> {
    try {
      await redis.del(`user:workspaces:${userId}`);
      if (workspaceId) {
        await redis.del(`workspace:${workspaceId}`);
        await redis.del(`workspace:diagrams:${workspaceId}`);
      }
      logger.info({ userId, workspaceId }, "♻️ CACHE INVALIDATED: Workspace directory cleared from Redis");
    } catch (err) {
      logger.error({ userId, workspaceId, err }, "Redis invalidation error in invalidateWorkspaceCache");
    }
  }

  // Helper to invalidate diagram details and parent workspace diagrams list
  private async invalidateDiagramCache(diagramId: string, workspaceId?: string): Promise<void> {
    try {
      await redis.del(`diagram:${diagramId}`);
      if (workspaceId) {
        await redis.del(`workspace:diagrams:${workspaceId}`);
      }
      logger.info({ diagramId, workspaceId }, "♻️ CACHE INVALIDATED: Diagram state cleared from Redis");
    } catch (err) {
      logger.error({ diagramId, workspaceId, err }, "Redis invalidation error in invalidateDiagramCache");
    }
  }

  // Workspaces
  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    const workspace = await this.rawWorkspaceService.createWorkspace(userId, input);
    await this.invalidateWorkspaceCache(userId);
    return workspace;
  }

  async getWorkspaces(userId: string): Promise<Workspace[]> {
    const key = `user:workspaces:${userId}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ userId }, "🚀 CACHE HIT: Served workspace list from Redis");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ userId, err }, "Redis GET error in getWorkspaces");
    }

    logger.warn({ userId }, "📉 CACHE MISS: Fetching workspace list from PostgreSQL...");
    const workspaces = await this.rawWorkspaceService.getWorkspaces(userId);

    try {
      await redis.set(key, JSON.stringify(workspaces), "EX", this.CACHE_TTL);
    } catch (err) {
      logger.error({ userId, err }, "Redis SET error in getWorkspaces");
    }

    return workspaces;
  }

  async getWorkspaceById(userId: string, id: string): Promise<Workspace> {
    const key = `workspace:${id}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        const workspace = JSON.parse(cached);
        if (workspace.userId === userId) {
          logger.info({ id, userId }, "🚀 CACHE HIT: Served workspace details from Redis");
          return workspace;
        }
      }
    } catch (err) {
      logger.error({ id, err }, "Redis GET error in getWorkspaceById");
    }

    const workspace = await this.rawWorkspaceService.getWorkspaceById(userId, id);

    try {
      await redis.set(key, JSON.stringify(workspace), "EX", this.CACHE_TTL);
    } catch (err) {
      logger.error({ id, err }, "Redis SET error in getWorkspaceById");
    }

    return workspace;
  }

  async updateWorkspace(userId: string, id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    const workspace = await this.rawWorkspaceService.updateWorkspace(userId, id, input);
    await this.invalidateWorkspaceCache(userId, id);
    return workspace;
  }

  async deleteWorkspace(userId: string, id: string): Promise<void> {
    await this.rawWorkspaceService.deleteWorkspace(userId, id);
    await this.invalidateWorkspaceCache(userId, id);
  }

  async getOrCreateDefaultWorkspace(userId: string): Promise<Workspace> {
    return await this.rawWorkspaceService.getOrCreateDefaultWorkspace(userId);
  }

  async getWorkspaceRaw(id: string): Promise<Workspace | null> {
    const key = `workspace:${id}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ id, err }, "Redis GET error in getWorkspaceRaw");
    }

    const workspace = await this.rawWorkspaceService.getWorkspaceRaw(id);

    if (workspace) {
      try {
        await redis.set(key, JSON.stringify(workspace), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ id, err }, "Redis SET error in getWorkspaceRaw");
      }
    }

    return workspace;
  }

  // Diagrams
  async createDiagram(userId: string, workspaceId: string, input: CreateDiagramInput): Promise<Diagram> {
    const diagram = await this.rawWorkspaceService.createDiagram(userId, workspaceId, input);
    await this.invalidateDiagramCache(diagram.id, workspaceId);
    return diagram;
  }

  async getDiagrams(userId: string, workspaceId: string): Promise<Diagram[]> {
    const key = `workspace:diagrams:${workspaceId}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ workspaceId }, "🚀 CACHE HIT: Served diagrams list from Redis");
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ workspaceId, err }, "Redis GET error in getDiagrams");
    }

    const diagrams = await this.rawWorkspaceService.getDiagrams(userId, workspaceId);

    try {
      await redis.set(key, JSON.stringify(diagrams), "EX", this.CACHE_TTL);
    } catch (err) {
      logger.error({ workspaceId, err }, "Redis SET error in getDiagrams");
    }

    return diagrams;
  }

  async getDiagramById(userId: string, id: string): Promise<Diagram & { isOwner: boolean }> {
    const key = `diagram:${id}`;
    let diagram: any = null;

    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.info({ id }, "🚀 CACHE HIT: Served diagram board details from Redis");
        diagram = JSON.parse(cached);
      }
    } catch (err) {
      logger.error({ id, err }, "Redis GET error in getDiagramById");
    }

    if (!diagram) {
      logger.warn({ id }, "📉 CACHE MISS: Fetching diagram board details from PostgreSQL...");
      const fullDiagram = await this.rawWorkspaceService.getDiagramById(userId, id);
      const { isOwner, ...staticDiagram } = fullDiagram;
      diagram = staticDiagram;

      try {
        await redis.set(key, JSON.stringify(staticDiagram), "EX", this.CACHE_TTL);
      } catch (err) {
        logger.error({ id, err }, "Redis SET error in getDiagramById");
      }
    }

    // Dynamically resolve parent workspace ownership safely without permission checks
    const workspace = await this.getWorkspaceRaw(diagram.workspaceId);
    const isOwner = workspace ? workspace.userId === userId : false;

    return {
      ...diagram,
      isOwner,
    };
  }

  async updateDiagram(userId: string, id: string, input: UpdateDiagramInput): Promise<Diagram> {
    const diagram = await this.rawWorkspaceService.updateDiagram(userId, id, input);
    await this.invalidateDiagramCache(id, diagram.workspaceId);
    return diagram;
  }

  async deleteDiagram(userId: string, id: string): Promise<void> {
    const diagram = await this.rawWorkspaceService.getDiagramById(userId, id);
    await this.rawWorkspaceService.deleteDiagram(userId, id);
    if (diagram) {
      await this.invalidateDiagramCache(id, diagram.workspaceId);
    }
  }

  async cloneDiagram(userId: string, id: string): Promise<Diagram> {
    const cloned = await this.rawWorkspaceService.cloneDiagram(userId, id);
    // Invalidate the cloned workspace's diagrams list cache
    await this.invalidateWorkspaceCache(userId, cloned.workspaceId);
    return cloned;
  }
}
