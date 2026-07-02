import { type IChatRepository } from "../../repositories/chat/chat.repository";
import { type IWorkspaceService } from "../../services/workspace/workspace.service";
import { type IAiDiagramService } from "../ai/ai-diagram.service";
import { type ICradle } from "../../libs/awilix-container";
import { AppError } from "../../utils/app-error";
import {
  type CreateChatThreadInput,
  type CreateChatMessageInput,
  type CanvasGraph,
} from "../../validators/chat.validator";
import type { ChatThread, ChatMessage } from "../../db/schema";
import { redis } from "../../libs/core/redis";

export interface IChatService {
  createThread(
    userId: string,
    input: CreateChatThreadInput,
  ): Promise<ChatThread>;
  getThreadsByDiagramId(
    userId: string,
    diagramId: string,
  ): Promise<ChatThread[]>;
  deleteThread(userId: string, threadId: string): Promise<void>;
  getMessages(userId: string, threadId: string): Promise<ChatMessage[]>;
  sendMessage(
    userId: string,
    threadId: string,
    input: CreateChatMessageInput,
  ): Promise<{ textResponse: string; canvasActions: any; thread?: ChatThread }>;
}

export class ChatService implements IChatService {
  private readonly chatRepository: IChatRepository;
  private readonly workspaceService: IWorkspaceService;
  private readonly aiDiagramService: IAiDiagramService;

  constructor({
    chatRepository,
    workspaceService,
    groqDiagramService,
  }: ICradle) {
    this.chatRepository = chatRepository;
    this.workspaceService = workspaceService;
    this.aiDiagramService = groqDiagramService;
  }

  // Verification Helper for Diagram Access
  private async verifyDiagramAccess(
    userId: string,
    diagramId: string,
  ): Promise<void> {
    const diagram = await this.workspaceService.getDiagramById(userId, diagramId);
    if (!diagram.isOwner) {
      throw AppError.forbidden("You do not have access to this diagram");
    }
  }

  // Verification Helper for Thread
  private async verifyThreadAccess(
    userId: string,
    threadId: string,
  ): Promise<ChatThread> {
    const thread = await this.chatRepository.findThreadById(threadId);
    if (!thread) {
      throw AppError.notFound(`Chat thread with ID ${threadId} not found`);
    }
    await this.verifyDiagramAccess(userId, thread.diagramId);
    return thread;
  }

  // Create thread
  async createThread(
    userId: string,
    input: CreateChatThreadInput,
  ): Promise<ChatThread> {
    await this.verifyDiagramAccess(userId, input.diagramId);
    return await this.chatRepository.createThread({
      diagramId: input.diagramId,
      title: input.title,
    });
  }

  // Fetch threads
  async getThreadsByDiagramId(
    userId: string,
    diagramId: string,
  ): Promise<ChatThread[]> {
    await this.verifyDiagramAccess(userId, diagramId);
    return await this.chatRepository.findThreadsByDiagramId(diagramId);
  }

  // Delete thread
  async deleteThread(userId: string, threadId: string): Promise<void> {
    await this.verifyThreadAccess(userId, threadId);
    await this.chatRepository.deleteThread(threadId);
  }

  // Get messages
  async getMessages(userId: string, threadId: string): Promise<ChatMessage[]> {
    await this.verifyThreadAccess(userId, threadId);
    return await this.chatRepository.findMessagesByThreadId(threadId);
  }

  // Send message & execute actions dynamically via Groq LLM
  async sendMessage(
    userId: string,
    threadId: string,
    input: CreateChatMessageInput,
  ): Promise<{ textResponse: string; canvasActions: any; thread?: ChatThread }> {
    let finalThreadId = threadId;
    let autoCreatedThread: ChatThread | undefined = undefined;

    // 🚀 Option B: Create the thread in DB dynamically on first message send!
    if (threadId.startsWith("temp-") || threadId === "new") {
      if (!input.diagramId) {
        throw AppError.badRequest(
          "diagramId is required to create a new conversation thread session",
        );
      }
      await this.verifyDiagramAccess(userId, input.diagramId);

      // A. Extract first 4 words of prompt as title (Option 1) - Zero AI requests!
      const words = input.prompt.trim().split(/\s+/);
      let generatedTitle = words.slice(0, 4).join(" ");
      if (generatedTitle.length > 40) {
        generatedTitle = generatedTitle.substring(0, 40) + "...";
      }
      if (!generatedTitle) {
        generatedTitle = "New Discussion";
      }

      // B. Create the new thread directly in database
      autoCreatedThread = await this.chatRepository.createThread({
        diagramId: input.diagramId,
        title: generatedTitle,
      });
      finalThreadId = autoCreatedThread.id;
    } else {
      await this.verifyThreadAccess(userId, finalThreadId);
    }

    // 1. Fetch previous message logs inside this thread for context
    const redisKey = `chat:thread:messages:${finalThreadId}`;
    const cachedMessages = await redis.lrange(redisKey, 0, -1);
    
    let formattedHistory: Array<{ role: "user" | "assistant", content: string }> = [];

    if (cachedMessages.length > 0) {
      formattedHistory = cachedMessages.map(m => JSON.parse(m));
    } else {
      const previousMessages =
        await this.chatRepository.findMessagesByThreadId(finalThreadId);
      formattedHistory = previousMessages.slice(-25).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      
      if (formattedHistory.length > 0) {
        const pipeline = redis.pipeline();
        formattedHistory.forEach(msg => pipeline.rpush(redisKey, JSON.stringify(msg)));
        pipeline.expire(redisKey, 3600); // 1 hour TTL
        await pipeline.exec();
      }
    }

    // 2. Execute dynamic LLM completion using the active canvas layout context
    // Prefer the new canvasGraph (semantic frame graph) over the legacy canvasState
    const canvasGraph: CanvasGraph | undefined = input.canvasGraph ?? undefined;
    const result = await this.aiDiagramService.generateDiagram(
      input.prompt,
      formattedHistory,
      canvasGraph,
    );

    // 3. Persist User Prompt Message
    await this.chatRepository.createMessage({
      threadId: finalThreadId,
      role: "user",
      content: input.prompt,
    });

    // 4. Persist Assistant Message response
    await this.chatRepository.createMessage({
      threadId: finalThreadId,
      role: "assistant",
      content: result.textResponse,
    });

    // Keep thread ordering aligned with the latest activity, not just creation time
    await this.chatRepository.touchThread(finalThreadId);

    // 5. Update Cache with the new interaction
    const pipeline = redis.pipeline();
    pipeline.rpush(redisKey, JSON.stringify({ role: "user", content: input.prompt }));
    pipeline.rpush(redisKey, JSON.stringify({ role: "assistant", content: result.textResponse }));
    pipeline.ltrim(redisKey, -25, -1);
    pipeline.expire(redisKey, 3600);
    await pipeline.exec();

    return {
      textResponse: result.textResponse,
      canvasActions: result.canvasActions,
      thread: autoCreatedThread,
    };
  }
}
