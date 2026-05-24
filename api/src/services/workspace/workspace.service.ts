import { type IWorkspaceRepository } from "../../repositories/workspace/workspace.repository";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import { type CreateWorkspaceInput, type UpdateWorkspaceInput, type CreateDiagramInput, type UpdateDiagramInput } from "../../validators/workspace.validator";
import type { Workspace, Diagram } from "../../db/schema";
import { createLogger } from "../../libs/utils/logger";

const logger = createLogger("workspace.service");

export interface IWorkspaceService {
  // Workspaces
  createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace>;
  getWorkspaces(userId: string): Promise<Workspace[]>;
  getWorkspaceById(userId: string, id: string): Promise<Workspace>;
  updateWorkspace(userId: string, id: string, input: UpdateWorkspaceInput): Promise<Workspace>;
  deleteWorkspace(userId: string, id: string): Promise<void>;
  getOrCreateDefaultWorkspace(userId: string): Promise<Workspace>;
  getWorkspaceRaw(id: string): Promise<Workspace | null>;

  // Diagrams
  createDiagram(userId: string, workspaceId: string, input: CreateDiagramInput): Promise<Diagram>;
  getDiagrams(userId: string, workspaceId: string): Promise<Diagram[]>;
  getDiagramById(userId: string, id: string): Promise<Diagram & { isOwner: boolean }>;
  updateDiagram(userId: string, id: string, input: UpdateDiagramInput): Promise<Diagram>;
  deleteDiagram(userId: string, id: string): Promise<void>;
  cloneDiagram(userId: string, id: string): Promise<Diagram>;
}

export class WorkspaceService implements IWorkspaceService {
  private readonly workspaceRepository: IWorkspaceRepository;

  constructor({ workspaceRepository }: ICradle) {
    this.workspaceRepository = workspaceRepository;
  }

  // Helper to verify workspace ownership
  private async checkWorkspaceOwnership(userId: string, workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw AppError.notFound(`Workspace with ID ${workspaceId} not found`);
    }
    if (workspace.userId !== userId) {
      throw AppError.forbidden("You do not have access to this workspace");
    }
    return workspace;
  }

  // Helper to verify diagram workspace ownership
  private async checkDiagramOwnership(userId: string, diagramId: string): Promise<Diagram> {
    const diagram = await this.workspaceRepository.findDiagramById(diagramId);
    if (!diagram) {
      throw AppError.notFound(`Diagram with ID ${diagramId} not found`);
    }
    await this.checkWorkspaceOwnership(userId, diagram.workspaceId);
    return diagram;
  }

  // Workspaces
  async createWorkspace(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    return await this.workspaceRepository.createWorkspace({
      userId,
      name: input.name,
      isDefault: false,
    });
  }

  async getWorkspaces(userId: string): Promise<Workspace[]> {
    const workspaces = await this.workspaceRepository.findWorkspacesByUserId(userId);
    if (workspaces.length === 0) {
      const defaultWorkspace = await this.getOrCreateDefaultWorkspace(userId);
      return [defaultWorkspace];
    }
    return workspaces;
  }

  async getWorkspaceById(userId: string, id: string): Promise<Workspace> {
    return await this.checkWorkspaceOwnership(userId, id);
  }

  async updateWorkspace(userId: string, id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    await this.checkWorkspaceOwnership(userId, id);
    return await this.workspaceRepository.updateWorkspace(id, input);
  }

  async deleteWorkspace(userId: string, id: string): Promise<void> {
    const workspace = await this.checkWorkspaceOwnership(userId, id);
    if (workspace.isDefault) {
      throw AppError.badRequest("You cannot delete your default workspace");
    }
    await this.workspaceRepository.deleteWorkspace(id);
  }

  async getOrCreateDefaultWorkspace(userId: string): Promise<Workspace> {
    const existing = await this.workspaceRepository.findDefaultWorkspaceByUserId(userId);
    if (existing) return existing;

    return await this.workspaceRepository.createWorkspace({
      userId,
      name: "Personal Workspace",
      isDefault: true,
    });
  }

  async getWorkspaceRaw(id: string): Promise<Workspace | null> {
    return await this.workspaceRepository.findWorkspaceById(id);
  }

  // Diagrams
  async createDiagram(userId: string, workspaceId: string, input: CreateDiagramInput): Promise<Diagram> {
    await this.checkWorkspaceOwnership(userId, workspaceId);
    return await this.workspaceRepository.createDiagram({
      workspaceId,
      title: input.title,
      documentState: null,
    });
  }

  async getDiagrams(userId: string, workspaceId: string): Promise<Diagram[]> {
    await this.checkWorkspaceOwnership(userId, workspaceId);
    return await this.workspaceRepository.findDiagramsByWorkspaceId(workspaceId);
  }

  async getDiagramById(userId: string, id: string): Promise<Diagram & { isOwner: boolean }> {
    const diagram = await this.workspaceRepository.findDiagramById(id);
    if (!diagram) {
      throw AppError.notFound(`Diagram with ID ${id} not found`);
    }
    const workspace = await this.workspaceRepository.findWorkspaceById(diagram.workspaceId);


    const isOwner = workspace ? workspace.userId === userId : false;
    logger.debug({ isOwner }, "[getDiagramById] isOwner Result");

    return {
      ...diagram,
      isOwner,
    };
  }

  async updateDiagram(userId: string, id: string, input: UpdateDiagramInput): Promise<Diagram> {
    await this.checkDiagramOwnership(userId, id);
    return await this.workspaceRepository.updateDiagram(id, input);
  }

  async deleteDiagram(userId: string, id: string): Promise<void> {
    await this.checkDiagramOwnership(userId, id);
    await this.workspaceRepository.deleteDiagram(id);
  }

  async cloneDiagram(userId: string, id: string): Promise<Diagram> {
    const sourceDiagram = await this.workspaceRepository.findDiagramById(id);
    if (!sourceDiagram) {
      throw AppError.notFound(`Source diagram with ID ${id} not found`);
    }
    const targetWorkspace = await this.getOrCreateDefaultWorkspace(userId);
    return await this.workspaceRepository.createDiagram({
      workspaceId: targetWorkspace.id,
      title: `Clone of ${sourceDiagram.title}`,
      documentState: sourceDiagram.documentState,
    });
  }
}
