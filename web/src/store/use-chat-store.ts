import { create } from "zustand";
import type {
  ChatThread,
  ChatMessage,
  CanvasGraph,
  SendMessageResponse,
} from "@/types/chat";
import * as chatQueries from "@/services/queries/chat.queries";
import * as chatMutations from "@/services/mutations/chat.mutations";

interface ChatStoreState {
  // Conversational states
  threads: ChatThread[];
  messages: ChatMessage[];
  activeThreadId: string | null;

  // UI Panel Visibility states
  isSidebarOpen: boolean;
  isLoadingThreads: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Simple State Mutators
  setThreads: (threads: ChatThread[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setActiveThreadId: (threadId: string | null) => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Dynamic API Actions
  loadThreads: (diagramId: string) => Promise<void>;
  loadMessages: (threadId: string) => Promise<void>;
  createThread: (diagramId: string, title: string) => Promise<ChatThread>;
  deleteThread: (threadId: string) => Promise<void>;
  sendMessage: (
    threadId: string,
    prompt: string,
    canvasGraph?: CanvasGraph,
  ) => Promise<SendMessageResponse>;

  reset: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  threads: [],
  messages: [],
  activeThreadId: null,
  isSidebarOpen: false,
  isLoadingThreads: false,
  isLoadingMessages: false,
  isSending: false,

  setThreads: (threads) => set({ threads }),
  setMessages: (messages) => set({ messages }),
  setActiveThreadId: (threadId) => set({ activeThreadId: threadId }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // Fetch threads for diagram
  loadThreads: async (diagramId) => {
    if (!diagramId) return;
    set({ isLoadingThreads: true });
    try {
      const fetchedThreads = await chatQueries.getThreads(diagramId);
      set({ threads: fetchedThreads });

      // If there are threads and no thread is active, auto-select the latest thread
      if (fetchedThreads.length > 0 && !get().activeThreadId) {
        const latestThread = fetchedThreads[0];
        set({ activeThreadId: latestThread.id });
        await get().loadMessages(latestThread.id);
      }
    } catch (error) {
      console.error("Error loading chat threads:", error);
    } finally {
      set({ isLoadingThreads: false });
    }
  },

  // Fetch messages in thread
  loadMessages: async (threadId) => {
    if (!threadId) return;
    set({ isLoadingMessages: true });
    try {
      const fetchedMessages = await chatQueries.getMessages(threadId);
      set({ messages: fetchedMessages });
    } catch (error) {
      console.error("Error loading conversational messages:", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  // Create new thread (UI-only — NO backend call until first message is sent!)
  createThread: async (diagramId, title) => {
    const tempThread: ChatThread = {
      id: `temp-${Date.now()}`,
      diagramId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      threads: [tempThread, ...state.threads],
      activeThreadId: tempThread.id,
      messages: [],
    }));
    return tempThread;
  },

  // Delete thread
  deleteThread: async (threadId) => {
    try {
      // Temp threads only exist in UI — skip backend delete API
      if (!threadId.startsWith("temp-")) {
        await chatMutations.deleteThread(threadId);
      }
      set((state) => {
        const remainingThreads = state.threads.filter((t) => t.id !== threadId);
        const nextActiveId =
          remainingThreads.length > 0 ? remainingThreads[0].id : null;

        return {
          threads: remainingThreads,
          activeThreadId: nextActiveId,
        };
      });

      const nextActiveId = get().activeThreadId;
      // Only load messages if it's a real (non-temp) thread
      if (nextActiveId && !nextActiveId.startsWith("temp-")) {
        await get().loadMessages(nextActiveId);
      } else {
        set({ messages: [] });
      }
    } catch (error) {
      console.error("Error deleting chat thread:", error);
      throw error;
    }
  },

  // Send message turn with semantic canvas graph
  sendMessage: async (threadId, prompt, canvasGraph) => {
    if (!threadId || !prompt.trim()) {
      throw new Error("Invalid thread or prompt");
    }

    set({ isSending: true });

    // 1. Optimistically append the User Prompt message bubble to the store for instant visual response
    const tempUserMsgId = `temp-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempUserMsgId,
      threadId,
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    try {
      // If this is a temp thread, grab its diagramId so backend can auto-create it
      const activeThread = get().threads.find((t) => t.id === threadId);
      const diagramId = activeThread?.diagramId;

      // 2. Query Hono AI agent completion endpoint
      const response = await chatMutations.sendMessage(threadId, {
        prompt,
        canvasGraph,
        diagramId,
      });

      // 3. Replace temp messages and add Assistant response bubble
      const tempAsstMsgId = `temp-asst-${Date.now()}`;
      const finalThreadId = response.thread?.id || threadId;
      const assistantMessage: ChatMessage = {
        id: tempAsstMsgId,
        threadId: finalThreadId,
        role: "assistant",
        content: response.textResponse,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        let nextThreads = state.threads;
        let nextActiveThreadId = state.activeThreadId;

        // Swap temp thread with the real persisted thread from backend
        if (response.thread) {
          nextThreads = state.threads.map((t) =>
            t.id === threadId ? response.thread! : t,
          );
          nextActiveThreadId = response.thread.id;
        }

        return {
          threads: nextThreads,
          activeThreadId: nextActiveThreadId,
          messages: [
            ...state.messages.filter((m) => m.id !== tempUserMsgId),
            { ...userMessage, id: `saved-${tempUserMsgId}`, threadId: finalThreadId },
            assistantMessage,
          ],
        };
      });

      return response;
    } catch (error) {
      console.error("Error sending message to Copilot:", error);

      // Rollback optimism on API failure
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempUserMsgId),
      }));
      throw error;
    } finally {
      set({ isSending: false });
    }
  },

  reset: () =>
    set({
      threads: [],
      messages: [],
      activeThreadId: null,
      isSidebarOpen: false,
      isLoadingThreads: false,
      isLoadingMessages: false,
      isSending: false,
    }),
}));
