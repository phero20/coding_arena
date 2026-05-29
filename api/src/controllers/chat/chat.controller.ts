import { BaseController } from "../base.controller";
import type { IChatService } from "../../services/chat/chat.service";
import type { ControllerRequest } from "../../types/infrastructure/hono.types";
import type { CreateChatThreadInput, CreateChatMessageInput } from "../../validators/chat.validator";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";

export class ChatController extends BaseController {
  private readonly chatService: IChatService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.chatService = cradle.chatService;
  }

  async createThread(req: ControllerRequest<CreateChatThreadInput>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    return await this.chatService.createThread(userId, req.body);
  }

  async getThreads(req: ControllerRequest<never, never, { diagramId: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { diagramId } = req.query;
    if (!diagramId) {
      throw AppError.badRequest("diagramId query parameter is required");
    }
    return await this.chatService.getThreadsByDiagramId(userId, diagramId);
  }

  async deleteThread(req: ControllerRequest<never, { id: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { id } = req.params;
    await this.chatService.deleteThread(userId, id);
    return { success: true };
  }

  async getMessages(req: ControllerRequest<never, { threadId: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { threadId } = req.params;
    return await this.chatService.getMessages(userId, threadId);
  }

  async sendMessage(req: ControllerRequest<CreateChatMessageInput, { threadId: string }>) {
    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized();
    }
    const { threadId } = req.params;
    return await this.chatService.sendMessage(userId, threadId, req.body);
  }
}
