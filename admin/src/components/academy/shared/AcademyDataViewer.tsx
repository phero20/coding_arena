"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { Copy, Check } from "lucide-react";

interface AcademyDataViewerProps {
  slug: string;
  item: any; // The item object containing { slug, data }
  isLoading: boolean;
  isError: boolean;
  error: any;
  itemName?: string; // e.g. "Track", "Config"
  onBack: () => void;
}

export function AcademyDataViewer({
  slug,
  item,
  isLoading,
  isError,
  error,
  itemName = "Item",
  onBack,
}: AcademyDataViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!item) return;
    navigator.clipboard.writeText(JSON.stringify(item.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage={`Loading ${itemName.toLowerCase()} details...`}
      isError={isError}
      error={error}
      errorTitle={`Failed to load ${itemName.toLowerCase()}`}
    >
      {!item ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">{itemName} not found.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-card z-10 pt-4 -mt-4">
            <div>
              <h3 className="text-lg font-medium tracking-tight">
                {itemName} Information: {item.slug}
              </h3>
              <p className="text-sm text-muted-foreground">
                Detailed JSON configuration for this {itemName.toLowerCase()}.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="h-8">
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
          </div>

          <div className="rounded-md border bg-muted/50 p-4 overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(item.data, null, 2)}
            </pre>
          </div>

          <div className="flex justify-end">
            <Button onClick={onBack}>Back to {itemName}s</Button>
          </div>
        </div>
      )}
    </QueryState>
  );
}
