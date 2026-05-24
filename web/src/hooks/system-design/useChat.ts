import { useCallback } from "react";
import { toast } from "sonner";
import { useChatStore } from "@/store/use-chat-store";
import { useDiagramStore } from "@/store/use-diagram-store";
import type {
  CanvasGraph,
  LLMCanvasAction,
  LLMCanvasActionCreate,
  LLMCanvasActionUpdate,
} from "@/types/chat";

import { buildCanvasGraph } from "./canvasGraph";
import { handleCreate } from "./handleCreate";
import { handleUpdate } from "./handleUpdate";

export function useChat() {
  const activeDiagram = useDiagramStore((state) => state.activeDiagram);

  const {
    threads,
    messages,
    activeThreadId,
    isSidebarOpen,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    setSidebarOpen,
    setActiveThreadId,
    loadThreads,
    loadMessages,
    createThread,
    deleteThread,
    sendMessage: storeSendMessage,
    reset,
  } = useChatStore();

  const refreshThreads = useCallback(async () => {
    if (activeDiagram?.id) {
      await loadThreads(activeDiagram.id);
    }
  }, [activeDiagram?.id, loadThreads]);

  // ─── Main sendMessage handler ─────────────────────────────────────────────

  const handleSendMessage = useCallback(
    async (prompt: string, tldrawEditor?: any) => {
      const currentThreadId = useChatStore.getState().activeThreadId;
      if (!currentThreadId) {
        throw new Error("No active thread session is currently open");
      }

      let canvasGraph: CanvasGraph | undefined;
      let semanticMap = new Map<string, string>();
      let framePrefixMap = new Map<string, string>();

      if (tldrawEditor) {
        try {
          const built = buildCanvasGraph(tldrawEditor);
          canvasGraph = built.canvasGraph;
          semanticMap = built.semanticMap;
          framePrefixMap = built.framePrefixMap;
        } catch (err) {
          console.error("Failed to build canvas graph:", err);
        }
      }

      let result;
      try {
        result = await storeSendMessage(currentThreadId, prompt, canvasGraph as any);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send message. Please try again."
        );
        throw err;
      }

      if (result.canvasActions && tldrawEditor) {
        const actions = result.canvasActions as LLMCanvasAction;

        try {
          if (actions.action === "CREATE") {
            await handleCreate(actions as LLMCanvasActionCreate, tldrawEditor);
          } else if (actions.action === "UPDATE") {
            await handleUpdate(
              actions as LLMCanvasActionUpdate,
              tldrawEditor,
              semanticMap,
              framePrefixMap
            );
          }
        } catch (canvasErr) {
          console.error("Failed to apply AI canvas modifications:", canvasErr);
        }
      }

      return result;
    },
    [storeSendMessage]
  );

  // ─── Return ───────────────────────────────────────────────────────────────

  return {
    threads,
    messages,
    activeThreadId,
    isSidebarOpen,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    activeDiagramId: activeDiagram?.id || null,

    setSidebarOpen,
    setActiveThreadId,
    refreshThreads,
    loadMessages,
    createThread: useCallback(
      (title: string) => {
        if (!activeDiagram?.id) throw new Error("No active diagram");
        return createThread(activeDiagram.id, title);
      },
      [activeDiagram?.id, createThread]
    ),
    deleteThread,
    sendMessage: handleSendMessage,
    reset,
  };
}
