import { db, schema } from "../../db";
import { eq, sql } from "drizzle-orm";
import type {
  ChatThread,
  NewChatThread,
  ChatMessage,
  NewChatMessage,
} from "../../db/schema";
import { type ICradle } from "../../libs/awilix-container";

export interface IChatRepository {
  createThread(thread: NewChatThread): Promise<ChatThread>;
  findThreadById(id: string): Promise<ChatThread | null>;
  findThreadsByDiagramId(diagramId: string): Promise<ChatThread[]>;
  deleteThread(id: string): Promise<void>;
  touchThread(id: string): Promise<void>;

  createMessage(message: NewChatMessage): Promise<ChatMessage>;
  findMessagesByThreadId(threadId: string): Promise<ChatMessage[]>;
}

export class ChatRepository implements IChatRepository {
  constructor(cradle: ICradle) {}

  // Threads
  async createThread(thread: NewChatThread): Promise<ChatThread> {
    const [created] = await db
      .insert(schema.chatThreads)
      .values(thread)
      .returning();
    return created;
  }

  async findThreadById(id: string): Promise<ChatThread | null> {
    const [thread] = await db
      .select()
      .from(schema.chatThreads)
      .where(eq(schema.chatThreads.id, id))
      .limit(1);
    return thread ?? null;
  }

  async findThreadsByDiagramId(diagramId: string): Promise<ChatThread[]> {
    return await db
      .select()
      .from(schema.chatThreads)
      .where(eq(schema.chatThreads.diagramId, diagramId))
      .orderBy(sql`${schema.chatThreads.updatedAt} DESC`);
  }

  async deleteThread(id: string): Promise<void> {
    await db.delete(schema.chatThreads).where(eq(schema.chatThreads.id, id));
  }

  async touchThread(id: string): Promise<void> {
    await db
      .update(schema.chatThreads)
      .set({ updatedAt: new Date() })
      .where(eq(schema.chatThreads.id, id));
  }

  // Messages
  async createMessage(message: NewChatMessage): Promise<ChatMessage> {
    const [created] = await db
      .insert(schema.chatMessages)
      .values(message)
      .returning();
    return created;
  }

  async findMessagesByThreadId(threadId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.threadId, threadId))
      .orderBy(sql`${schema.chatMessages.createdAt} ASC`);
  }
}
