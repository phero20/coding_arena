import React from "react";
import { ErrorDisplay, EmptyDisplay } from "./StatusState";
import { LucideIcon } from "lucide-react";

interface QueryGuardProps<T> {
  loading: boolean;
  error: any;
  data?: T | null;
  isEmpty?: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode | ((data: T) => React.ReactNode);
  
  // Customization Props
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  retryText?: string;
  
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

/**
 * QueryGuard: The Master State Orchestrator
 * Centralizes if(loading), if(error), and if(empty) patterns into a single declarative wrapper.
 * Ensures 100% consistent loading/error UI across the entire Arena platform.
 */
export function QueryGuard<T>({
  loading,
  error,
  data,
  isEmpty,
  skeleton,
  children,
  errorTitle,
  errorMessage,
  onRetry,
  retryText,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
}: QueryGuardProps<T>) {
  // 1. Loading Path: Render high-fidelity skeleton if we have no data yet
  // We check for !data OR an empty array to ensure initial fetches show the skeleton, not the empty state.
  const hasNoData = data === undefined || data === null || (Array.isArray(data) && data.length === 0);
  
  if (loading && hasNoData) {
    return skeleton ? <>{skeleton}</> : null;
  }

  // 2. Error Path: Render premium themed ErrorDisplay
  if (error) {
    return (
      <ErrorDisplay
        title={errorTitle || "System Error"}
        message={errorMessage || (error instanceof Error ? error.message : "The connection to the sector has been lost.")}
        onRetry={onRetry}
        retryText={retryText}
      />
    );
  }

  // 3. Empty Path: Render themed EmptyDisplay if explicit isEmpty or null data
  const isDataEmpty = isEmpty || (data === undefined || data === null || (Array.isArray(data) && data.length === 0));
  
  if (isDataEmpty) {
    return (
      <EmptyDisplay
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  // 4. Success Path: Render children (supports standard JSX or render prop)
  if (typeof children === "function" && data !== undefined && data !== null) {
    return <>{children(data)}</>;
  }

  return <>{children as React.ReactNode}</>;
}
