import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { QueryState } from "@/components/ui/query-state";
import { useContestAdmin } from "@/hooks/useContest";

interface ContestViewerProps {
  id: string;
  onBack: () => void;
}

export function ContestViewer({ id, onBack }: ContestViewerProps) {
  const { contests, isLoading, isError, error } = useContestAdmin();
  const contest = contests?.find(c => c.id === id);

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading contest details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load contest"
    >
      {!contest ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">Contest not found.</p>
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
                  Contest Information: {contest.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Platform: {contest.platform} | Status: {contest.status}
                </p>
              </div>
          </div>
        </div>

          <div className="rounded-md border bg-muted/20 p-6 flex-1 overflow-auto min-h-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Clist ID</h4>
                <p className="text-sm font-mono text-muted-foreground">{contest.clistId || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Resource ID</h4>
                <p className="text-sm font-mono text-muted-foreground">{contest.resourceId || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Start Time</h4>
                <p className="text-sm font-mono text-muted-foreground">{new Date(contest.startTime).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">End Time</h4>
                <p className="text-sm font-mono text-muted-foreground">{new Date(contest.endTime).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Duration (Seconds)</h4>
                <p className="text-sm font-mono text-muted-foreground">{contest.duration}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Link</h4>
                {contest.href ? (
                  <a href={contest.href} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                    View Contest
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  );
}