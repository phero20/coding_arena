import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { QueryState } from "@/components/ui/query-state";
import { useReportBugAdmin } from "@/hooks/useReportBug";
import { Badge } from "@/components/ui/badge";

interface ReportBugViewerProps {
  id: string;
  onBack: () => void;
}

export function ReportBugViewer({ id, onBack }: ReportBugViewerProps) {
  const { reports, isLoading, isError, error } = useReportBugAdmin();
  const report = reports?.find(r => r.id === id);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return <Badge variant="destructive">{status}</Badge>;
      case "in_progress": return <Badge variant="default">{status}</Badge>;
      case "resolved": return <Badge variant="secondary" className="bg-green-500/10 text-green-500">{status}</Badge>;
      case "closed": return <Badge variant="outline">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug": return <Badge variant="destructive">{type}</Badge>;
      case "ui": return <Badge variant="secondary">{type}</Badge>;
      case "feature": return <Badge variant="default">{type}</Badge>;
      case "feedback": return <Badge variant="outline">{type}</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading bug report details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load bug report"
    >
      {!report ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">Bug report not found.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon-lg" onClick={onBack} title="Go Back" className="gap-1 rounded-full shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-medium tracking-tight">
                  Bug Report: {report.title}
                </h3>
                <div className="flex gap-2 items-center mt-1">
                  {getTypeBadge(report.type)}
                  {getStatusBadge(report.status)}
                </div>
              </div>
          </div>
        </div>

          <div className="rounded-md border bg-muted/20 p-6 flex-1 overflow-auto min-h-0 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-1">ID</h4>
                <p className="text-sm font-mono text-muted-foreground">{report.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Created At</h4>
                <p className="text-sm font-mono text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <div className="bg-background border rounded-md p-4 text-sm text-foreground whitespace-pre-wrap">
                {report.description}
              </div>
            </div>

            {report.images && report.images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Attached Images</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {report.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-md border overflow-hidden bg-background aspect-video group">
                      <img 
                        src={imgUrl} 
                        alt={`Attachment ${idx + 1}`} 
                        className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(imgUrl, '_blank')}
                      />
                      <div className="absolute bottom-2 right-2">
                        <Button size="sm" variant="secondary" onClick={() => window.open(imgUrl, '_blank')}>View Full</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </QueryState>
  );
}
