import { ChatService } from "../chat.service";
import type { ChatThread, ChatMessage } from "@/types/chat";

/**
 * Fetch all chat threads belonging to a specific diagram.
 */
export async function getThreads(diagramId: string): Promise<ChatThread[]> {
  return await ChatService.getThreads(diagramId);
}

/**
 * Fetch all conversational message bubbles for a specific chat thread.
 */
export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  return await ChatService.getMessages(threadId);
}
