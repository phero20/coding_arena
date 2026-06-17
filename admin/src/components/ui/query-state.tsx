import React from "react";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/components/ui/api-error";

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: any;
  loadingMessage?: string;
  errorTitle?: string;
  children: React.ReactNode;
}

export function QueryState({
  isLoading,
  isError,
  error,
  loadingMessage = "Loading...",
  errorTitle = "Error",
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-6">
        <ApiError error={error} title={errorTitle} />
      </div>
    );
  }

  return <>{children}</>;
}
