"use client";

import { useCacheAdmin } from "@/hooks/useCache";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { QueryState } from "@/components/ui/query-state";

interface CacheViewerProps {
  id: string; // The cache key
  onBack: () => void; // Keeping onBack purely for interface compatibility, though left pane stays
}

function formatTTL(seconds: number) {
  if (seconds <= 0) return "None";
  if (seconds < 60) return `${seconds}s`;
  
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && d === 0) parts.push(`${s}s`);
  
  return parts.join(' ');
}

export function CacheViewer({ id: cacheKey, onBack }: CacheViewerProps) {
  const { useGetKeyDetails } = useCacheAdmin();
  const { data: details, isLoading, isError, error } = useGetKeyDetails(cacheKey);

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading key details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load key"
    >
      <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
        {/* Header exact match to CategoryDetails */}
        <div className="shrink-0 p-4 md:p-6 md:px-10 lg:px-12 pb-6 border-b border-border/50 sticky top-0 bg-background z-20 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">Key Details</h2>
                {details?.type && (
                  <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground mt-1 uppercase">
                    /{details.type}
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-lg mt-2 font-mono break-all">
                {cacheKey}
              </p>
            </div>

            <div className="flex items-center shrink-0">
              {details?.ttl !== undefined && (
                <Badge variant={details.ttl > 0 ? "secondary" : "destructive"} className="font-mono text-sm px-3 py-1">
                  TTL: {formatTTL(details.ttl)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Body exact match to CategoryDetails */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 md:px-10 lg:px-12 pt-6 pb-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Cached Value</h3>
                <p className="text-sm text-muted-foreground">
                  The raw JSON or String content currently stored under this key.
                </p>
              </div>
            </div>

            {!details?.value ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed">
                <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No Value Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2">
                  This key exists but its value could not be resolved or was empty.
                </p>
              </div>
            ) : (
              <div className="">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words p-4">
                  {typeof details.value === "object"
                    ? JSON.stringify(details.value, null, 2)
                    : String(details.value)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </QueryState>
  );
}
