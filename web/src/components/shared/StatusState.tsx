import React from "react";
import {
  AlertCircle,
  Terminal,
  Loader2,
  LucideIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Premium Centered Error Display Component (Shadcn Alert Pure)
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
  <div
    className={cn(
      "h-screen w-full flex items-center justify-center p-6",
      className,
    )}
  >
    <Card className="max-w-md w-full">
      <CardHeader className="flex flex-col items-center gap-4 text-center pb-2">
        <div className="size-12 rounded-full bg-destructive/20 flex items-center justify-center border border-destructive/20">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <CardTitle className="text-xl font-black uppercase tracking-tight  text-destructive">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[280px]">
          {message ||
            "We encountered an unexpected error while performing this action."}
        </p>
        {onRetry && (
          <Button
            variant="destructive"
            size="lg"
            onClick={onRetry}
            className=""
          >
            <RefreshCw size={14} className="mr-2" />
            {retryText}
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

/**
 * Standardized Empty State Component (Shadcn Card Pure)
 */
export const EmptyDisplay = ({
  icon: Icon = Terminal,
  title = "Nothing Found",
  message,
  action,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <Card
    className={cn(
      "flex flex-col items-center justify-center py-10 text-center border-dashed border-2 bg-muted/5 animate-in fade-in duration-500",
      className,
    )}
  >
    <CardHeader className="p-0 flex flex-col items-center gap-2">
      <div className="p-3 rounded-full bg-muted/20 border border-border/10 mb-2">
        <Icon className="size-6 text-muted-foreground/40" />
      </div>
      <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">
        {title}
      </CardTitle>
      {message && (
        <CardDescription className="text-xs text-muted-foreground/40 font-medium max-w-[240px] leading-relaxed mx-auto">
          {message}
        </CardDescription>
      )}
      {action ? <div className="mt-4">{action}</div> : null}
    </CardHeader>
  </Card>
);

/**
 * High-End Full Page Loading Overlay
 */
export const FullPageOverlay = ({
  message = "Loading...",
}: {
  message?: string;
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xl z-50 animate-in fade-in duration-300">
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
          <div className="h-full w-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Global Connection Status Badge (Shadcn Badge Pure)
 */
export const ConnectionBadge = ({
  isConnected,
  message = "Reconnecting to Arena...",
}: {
  isConnected: boolean;
  message?: string;
}) => {
  if (isConnected) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <Badge
        variant="secondary"
        className="px-4 py-1.5"
      >
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
          {message}
        </span>
      </Badge>
    </div>
  );
};
