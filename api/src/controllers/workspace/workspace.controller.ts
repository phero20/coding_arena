import { BaseController } from "../base.controller";
import type { IWorkspaceService } from "../../services/workspace/workspace.service";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import type { CreateWorkspaceInput, UpdateWorkspaceInput, CreateDiagramInput, UpdateDiagramInput } from "../../validators/workspace.validator";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";

export class WorkspaceController extends BaseController {
  private readonly workspaceService: IWorkspaceService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.workspaceService = cradle.workspaceService;
  }

  // Workspaces
  async createWorkspace(req: ControllerRequest<CreateWorkspaceInput>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    return await this.workspaceService.createWorkspace(userId, req.body);
  }

  async getWorkspaces(req: ControllerRequest<never>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    return await this.workspaceService.getWorkspaces(userId);
  }

  async getWorkspaceById(req: ControllerRequest<never, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    return await this.workspaceService.getWorkspaceById(userId, id);
  }

  async updateWorkspace(req: ControllerRequest<UpdateWorkspaceInput, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    return await this.workspaceService.updateWorkspace(userId, id, req.body);
  }

  async deleteWorkspace(req: ControllerRequest<never, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    await this.workspaceService.deleteWorkspace(userId, id);
    return { success: true };
  }

  // Diagrams
  async createDiagram(req: ControllerRequest<CreateDiagramInput, { workspaceId: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { workspaceId } = req.params;
    return await this.workspaceService.createDiagram(userId, workspaceId, req.body);
  }

  async getDiagrams(req: ControllerRequest<never, { workspaceId: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { workspaceId } = req.params;
    return await this.workspaceService.getDiagrams(userId, workspaceId);
  }

  async getDiagramById(req: ControllerRequest<never, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    return await this.workspaceService.getDiagramById(userId, id);
  }

  async updateDiagram(req: ControllerRequest<UpdateDiagramInput, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    return await this.workspaceService.updateDiagram(userId, id, req.body);
  }

  async deleteDiagram(req: ControllerRequest<never, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    await this.workspaceService.deleteDiagram(userId, id);
    return { success: true };
  }

  async cloneDiagram(req: ControllerRequest<never, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    return await this.workspaceService.cloneDiagram(userId, id);
  }
}
