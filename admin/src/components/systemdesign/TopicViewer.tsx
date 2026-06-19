import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/ui/query-state";
import { Copy, Check, ChevronLeft } from "lucide-react";
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
        <div className="flex flex-col h-full min-h-0 space-y-4">
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon-lg" onClick={onBack} title="Go Back" className="gap-1 rounded-full shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-medium tracking-tight">
                  Topic Information: {topic.slug}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Title: {topic.title} | ID: {topic.topic_id} | Order: {topic.order}
                </p>
              </div>
            </div>
            <Button variant="outline" size="lg" onClick={handleCopy} className="gap-2 px-4 shrink-0">
              {copied ? <Check className="text-green-500 w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Content"}
            </Button>
          </div>

          <div className="rounded-md border bg-muted/20 p-4 flex-1 overflow-auto min-h-0 relative">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {topic.content}
            </pre>
          </div>
        </div>
      )}
    </QueryState>
  );
}
