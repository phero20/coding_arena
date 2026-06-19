"use client";

import { useCacheAdmin } from "@/hooks/useCache";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


interface CacheKeyDetailsModalProps {
  cacheKey: string | null;
  onClose: () => void;
}

export default function CacheKeyDetailsModal({ cacheKey, onClose }: CacheKeyDetailsModalProps) {
  const { useGetKeyDetails } = useCacheAdmin();
  const { data: details, isLoading } = useGetKeyDetails(cacheKey || "");

  return (
    <Dialog open={!!cacheKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Key Details
            {details?.type && (
              <Badge variant="outline" className="uppercase font-mono text-xs">
                {details.type}
              </Badge>
            )}
            {details?.ttl !== undefined && details.ttl > 0 && (
              <Badge variant="secondary" className="font-mono text-xs">
                TTL: {details.ttl}s
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4 overflow-hidden flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Key Path</h4>
            <code className="text-sm bg-muted px-2 py-1 rounded block overflow-hidden text-ellipsis whitespace-nowrap">
              {cacheKey}
            </code>
          </div>

          <h4 className="text-sm font-medium text-muted-foreground mb-2">Value</h4>
          <ScrollArea className="flex-1 bg-muted/50 rounded-md border">
            <div className="p-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8 animate-pulse">
                  Loading value...
                </div>
              ) : details?.value ? (
                <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                  {typeof details.value === "object"
                    ? JSON.stringify(details.value, null, 2)
                    : String(details.value)}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No value found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
