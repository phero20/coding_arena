import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  ChatThread,
  ChatMessage,
  CreateChatThreadInput,
  CreateChatMessageInput,
  SendMessageResponse,
} from "@/types/chat";

/**
 * ChatService
 * Encapsulates all chat threads and message API request operations.
 * Isolates the hooks and state stores from direct HTTP library client calls.
 */
export class ChatService {
  /**
   * Fetch all conversational threads associated with a particular diagram canvas.
   */
  static async getThreads(diagramId: string): Promise<ChatThread[]> {
    const response = await apiClient.get<ApiResponse<ChatThread[]>>(
      `/chat/threads?diagramId=${encodeURIComponent(diagramId)}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch chat threads");
    }

    return response.data.data;
  }

  /**
   * Fetch message history logs inside a single chat thread.
   */
  static async getMessages(threadId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>(
      `/chat/threads/${threadId}/messages`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to fetch conversational messages");
    }

    return response.data.data;
  }

  /**
   * Create a brand new conversational workspace thread.
   */
  static async createThread(data: CreateChatThreadInput): Promise<ChatThread> {
    const response = await apiClient.post<ApiResponse<ChatThread>>("/chat/threads", data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to create chat thread");
    }

    return response.data.data;
  }

  /**
   * Delete an existing thread session and all associated message data.
   */
  static async deleteThread(threadId: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/chat/threads/${threadId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to delete chat thread");
    }

    return true;
  }

  /**
   * Send a user prompt along with the active layout coordinates of the canvas.
   * Resolves with the textual explanation and structural grid transformation actions.
   */
  static async sendMessage(
    threadId: string,
    data: CreateChatMessageInput
  ): Promise<SendMessageResponse> {
    const response = await apiClient.post<ApiResponse<SendMessageResponse>>(
      `/chat/threads/${threadId}/messages`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to deliver message to Copilot agent");
    }

    return response.data.data;
  }
}
