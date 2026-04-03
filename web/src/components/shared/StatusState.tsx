import React from "react";
import { AlertCircle, Terminal, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Premium Centered Error Display Component
 */
export const ErrorDisplay = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Retry",
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}) => (
  <div className={cn("h-full w-full flex items-center justify-center p-6", className)}>
    <div className="text-center space-y-6 max-w-md p-8 border border-destructive/20 rounded-3xl bg-destructive/5 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
      <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto relative shadow-2xl shadow-destructive/10">
        <AlertCircle className="size-8 text-destructive animate-pulse" />
        <div className="absolute inset-0 rounded-2xl bg-destructive/5 blur-xl -z-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground italic">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
          {message || "We encountered an unexpected error while performing this action."}
        </p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            onClick={onRetry}
            className="px-8 py-6 rounded-full bg-destructive text-destructive-foreground font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-destructive/20"
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  </div>
);

/**
 * Standardized Empty State Component
 */
export const EmptyDisplay = ({
  icon: Icon = Terminal,
  title = "Nothing Found",
  message,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
}) => (
  <div className={cn("flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in duration-500", className)}>
    <div className="size-16 rounded-full bg-muted/5 flex items-center justify-center border border-border/20 mb-2 group-hover:scale-110 transition-transform">
      <Icon className="size-8 text-muted-foreground/30" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">
        {title}
      </h3>
      {message && (
        <p className="text-xs text-muted-foreground/40 font-medium max-w-[240px] leading-relaxed mx-auto">
          {message}
        </p>
      )}
    </div>
  </div>
);

/**
 * High-End Full Page Loading Overlay
 */
export const FullPageOverlay = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xl z-(--z-overlay) animate-in fade-in duration-300">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Loader2 className="size-12 text-primary animate-spin" />
        <div className="absolute inset-0 size-12 bg-primary/20 blur-2xl -z-10 animate-pulse" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse ml-[0.3em]">
          {message}
        </p>
        <div className="h-0.5 w-12 bg-primary/20 mx-auto rounded-full mt-2 overflow-hidden">
          <div className="h-full w-full bg-primary animate-progress" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Global Connection Status Badge
 */
export const ConnectionBadge = ({ isConnected, message = "Reconnecting to Arena..." }: { isConnected: boolean, message?: string }) => {
  if (isConnected) return null;
  
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-(--z-nav) animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 backdrop-blur-md border border-secondary/20 shadow-2xl shadow-secondary/5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">
          {message}
        </span>
      </div>
    </div>
  );
};
