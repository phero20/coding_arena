import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useSystemDesignAdmin } from "@/hooks/useSystemDesign";

interface TopicViewerProps {
  slug: string;
  onBack: () => void;
}

export function TopicViewer({ slug, onBack }: TopicViewerProps) {
  const { topics, isLoading, isError, error } = useSystemDesignAdmin();
  const [copied, setCopied] = useState(false);

  const topic = topics.find(t => t.slug === slug);

  const handleCopy = () => {
    if (!topic) return;
    navigator.clipboard.writeText(topic.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading topic details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load topic"
    >
      {!topic ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">Topic not found.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-card z-10 pt-4 -mt-4">
            <div>
              <h3 className="text-lg font-medium tracking-tight">
                {topic.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  ID: {topic.topic_id}
                </span>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  Order: {topic.order}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-8">
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied Content!" : "Copy Content"}
              </Button>
              <Button variant="outline" size="sm" onClick={onBack} className="h-8">
                Back to Topics
              </Button>
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-6 overflow-auto min-h-[400px]">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {topic.content}
            </pre>
          </div>
        </div>
      )}
    </QueryState>
  );
}
