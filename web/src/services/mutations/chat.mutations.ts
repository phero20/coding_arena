import { ChatService } from "../chat.service";
import type { 
  ChatThread, 
  CreateChatThreadInput, 
  CreateChatMessageInput, 
  SendMessageResponse 
} from "@/types/chat";

/**
 * Spawn a new chat thread for a specific diagram workspace canvas.
 */
export async function createThread(input: CreateChatThreadInput): Promise<ChatThread> {
  return await ChatService.createThread(input);
}

/**
 * Permanently delete a chat thread and all its messages.
 */
export async function deleteThread(threadId: string): Promise<boolean> {
  return await ChatService.deleteThread(threadId);
}

/**
 * Send a user message along with current active canvas state coordinates.
 */
export async function sendMessage(
  threadId: string,
  input: CreateChatMessageInput
): Promise<SendMessageResponse> {
  return await ChatService.sendMessage(threadId, input);
}
