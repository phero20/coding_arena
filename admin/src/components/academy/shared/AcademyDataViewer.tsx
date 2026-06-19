"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { Copy, Check, ChevronLeft } from "lucide-react";

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
          <Button title="Go Back" onClick={onBack}>Go Back</Button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4">
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon-lg" onClick={onBack} title="Go Back" className="gap-1 rounded-full">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-medium tracking-tight">
                  {itemName} Information: {item.slug}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Detailed JSON configuration for this {itemName.toLowerCase()}.
                </p>
              </div>
            </div>
            <Button variant="outline" size="lg" onClick={handleCopy}  className="gap-2 px-4">
              {copied ? (
                <Check className=" text-green-500" />
              ) : (
                <Copy />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
          </div>

          <div className="rounded-md border bg-muted/20 p-4 flex-1 overflow-auto min-h-0 relative">
            <pre className="text-sm font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(item.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </QueryState>
  );
}
