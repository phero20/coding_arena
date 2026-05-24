"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/system-design/useChat";
import { getActiveFrameInfo } from "@/hooks/system-design/canvasGraph";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  Trash2,
  MessageSquare,
  Plus,
  Brain,
  Loader2,
  History,
  MessageCircle,
  ArrowLeft,
  ArrowUp,
  AlertTriangle,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatCopilotPanelProps {
  editor: any;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="icon"
      className="h-6 w-6 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-transparent"
      aria-label="Copy message"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-difficulty-easy" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function ChatCopilotPanel({ editor }: ChatCopilotPanelProps) {
  const {
    threads,
    messages,
    activeThreadId,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    activeDiagramId,
    refreshThreads,
    loadMessages,
    setActiveThreadId,
    createThread,
    deleteThread,
    sendMessage,
    reset,
  } = useChat();

  const [prompt, setPrompt] = useState("");
  const [threadToDelete, setThreadToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeSubview, setActiveSubview] = useState<"chat" | "history">(
    "chat",
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeContextFrame, setActiveContextFrame] = useState<{ id: string; title: string } | null>(null);

  // Periodically poll the active frame based on selection or viewport
  useEffect(() => {
    if (!editor) return;
    const interval = setInterval(() => {
      const info = getActiveFrameInfo(editor);
      setActiveContextFrame(info);
    }, 500);
    return () => clearInterval(interval);
  }, [editor]);

  // Cycle loading indicators one by one with a minor delay
  useEffect(() => {
    if (!isSending) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, [isSending]);

  const loadingTexts = ["planning...", "generating...", "routing..."];
  const currentLoadingText = loadingTexts[loadingStep];

  // Auto-resize textarea height as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      // Cap at 120px max height
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // Key handler to support Enter-to-Submit and Shift-Enter-for-Newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isSending) {
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  // Load threads on mount/diagram shift
  useEffect(() => {
    // Only fetch if we have an active diagram AND we haven't already loaded threads for it
    if (activeDiagramId && threads.length === 0) {
      refreshThreads();
    }
  }, [activeDiagramId, refreshThreads, threads.length]);

  // Sync messages whenever activeThreadId shifts (skip temp threads — they have no DB messages yet)
  useEffect(() => {
    if (activeThreadId && !activeThreadId.startsWith("temp-")) {
      loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  // Smooth scroll feed when new bubbles arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isSending, activeSubview]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;

    const currentPrompt = prompt;
    setPrompt(""); // Clear input early for maximum snappy UI feel

    try {
      // 🚀 If no active thread exists yet, auto-create a temp one in UI first
      // sendMessage will then lazily persist it to DB on first send with the extracted title
      if (!activeThreadId && activeDiagramId) {
        await createThread(`Discussion #${threads.length + 1}`);
        // activeThreadId in store is now set to the temp thread ID
      }

      await sendMessage(currentPrompt, editor);
    } catch (err) {
      console.error("Message delivery failed:", err);
      setPrompt(currentPrompt); // Rollback input on network error
    }
  };

  const handleNewChat = () => {
    if (!activeDiagramId) return;
    // Create a UI-only temp thread — NO backend request until first message is sent
    const threadCount = threads.length + 1;
    createThread(`Discussion #${threadCount}`);
    setActiveSubview("chat");
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const headerTitle = activeThread ? activeThread.title : "AI Chat";

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background overflow-hidden border-t">
      {/* Sleek Subtab Header bar using Shadcn buttons */}
      <div className="p-2 border-b flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="text-xs font-semibold tracking-tight text-foreground truncate max-w-[155px]"
            title={headerTitle}
          >
            {headerTitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* AI Limitations Hover Note */}
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-difficulty-medium"
                >
                  <AlertTriangle className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="!bg-popover !text-popover-foreground border border-border shadow-md p-3.5 w-72 rounded-md space-y-2 z-999"
              >
                <div className="font-semibold text-difficulty-medium text-sm">AI Limitations</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This AI assistant is experimental and not perfect. It may make mistakes, hallucinate components, or create messy layouts for complex systems.
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                    Tip
                  </div>
                  <div className="p-2 rounded bg-background/50 text-[11px] text-muted-foreground border border-border leading-relaxed">
                    Use the AI to quickly bootstrap the rough architecture, but rely on <strong className="text-foreground font-medium">manual drag-and-drop edits</strong> on the canvas to refine and perfect the final design!
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* History subtab toggle button */}
          <Button
            variant={activeSubview === "history" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() =>
              setActiveSubview(activeSubview === "history" ? "chat" : "history")
            }
            title="Chat History"
          >
            <History className="h-3.5 w-3.5" />
          </Button>

          {/* New Chat fast-action button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleNewChat}
            title="Start New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* RENDER ACTIVE CHAT PANEL SUBVIEW */}
      {activeSubview === "chat" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <div
            ref={scrollContainerRef}
            className="flex-1 p-3 overflow-y-scroll flex flex-col"
          >
            {isLoadingThreads || isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed">
                  Ask AI to generate, wire up, and design system components
                  instantly.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-4">
                {messages.map((msg) => {
                  const isAssistant = msg.role === "assistant";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "group flex flex-col gap-1 max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed transition-all relative",
                        isAssistant
                          ? "bg-muted text-muted-foreground self-start border"
                          : "bg-primary text-primary-foreground self-end",
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="whitespace-pre-wrap flex-1">{msg.content}</p>
                        <CopyButton text={msg.content} />
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center gap-1  text-xs  text-muted-foreground self-start">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                    <span className="capitalize">{currentLoadingText}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {messages.length === 0 && !prompt.trim() && !isSending && (
            <div className="w-full flex flex-col gap-2 text-left mb-3 px-3">
              {[
                "Design a secure e-commerce checkout flow",
                "Add Nginx gateway with Node.js and Postgres",
                "Create serverless stack with API Gateway & Lambda",
              ].map((text) => (
                <Button
                  key={text}
                  type="button"
                  onClick={() => setPrompt(text)}
                  variant="secondary"
                  size="lg"
                  className="w-full justify-start text-left text-xs font-medium whitespace-normal h-auto py-2 px-3 leading-snug"
                >
                  {text}
                </Button>
              ))}
            </div>
          )}
          {/* Interactive Chat Input Area */}
          <div className="p-3 shrink-0 flex flex-col gap-3 bg-background relative border-t z-20">


            {/* Active Context UI Pill */}



            <form onSubmit={handleSend} className="flex flex-col gap-2">
              {activeContextFrame && (
                <div className="z-10 flex justify-start pointer-events-none w-full">
                  <Card className="max-w-full px-3 border-primary/30 py-1.5 text-[10px] text-muted-foreground rounded-md font-medium flex items-center gap-1.5 pointer-events-auto overflow-hidden">
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 shrink-0 cursor-help text-difficulty-medium transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="bg-popover text-popover-foreground border shadow-md max-w-xs text-xs p-2.5 rounded z-50 pointer-events-auto ml-2"
                        >
                          <p>This is the diagram the AI is currently focused on.</p>
                          <p className="text-muted-foreground mt-1 text-[10px]">Scroll the canvas or select a different diagram frame to change the AI's context.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="truncate min-w-0">Selected: {activeContextFrame.title}</span>
                  </Card>
                </div>
              )}
              <Card className="flex flex-col p-2 bg-muted/20">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isSending
                      ? "Resolving canvas layers..."
                      : "Ask AI to draw architecture..."
                  }
                  rows={1}
                  className="w-full text-xs bg-transparent border-0 focus:outline-none focus:ring-0 resize-none p-1.5 min-h-[36px] max-h-[120px] overflow-y-auto leading-normal text-foreground placeholder:text-muted-foreground/70"
                />

                <div className="flex items-center justify-end pt-0.5 shrink-0">
                  <Button
                    type="submit"
                    disabled={!prompt.trim() || isSending}
                    size="icon"
                    className="h-6 w-6"
                  >
                    {isSending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ArrowUp className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </Card>
            </form>
          </div>
        </div>
      )}

      {/* RENDER PREVIOUS CHATS HISTORY SUBTAB */}
      {activeSubview === "history" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 pb-1 shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Previous Conversations
            </span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">
                  No conversations yet.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {threads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setActiveThreadId(thread.id);
                        setActiveSubview("chat");
                      }}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer transition-all",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium border border-border"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{thread.title}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-destructive hover:bg-transparent transition-all shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThreadToDelete({
                            id: thread.id,
                            title: thread.title,
                          });
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-md text-destructive font-bold">
              Delete Chat History?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete the conversation{" "}
              <strong>{threadToDelete?.title}</strong>? This action is permanent
              and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-8 text-xs font-bold border-border"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (threadToDelete) {
                  deleteThread(threadToDelete.id);
                  setIsDeleteOpen(false);
                  setThreadToDelete(null);
                }
              }}
              className="h-8 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
