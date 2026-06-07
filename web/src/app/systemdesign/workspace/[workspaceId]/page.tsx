"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Search, Folder, Info, FileText, ArrowLeft } from "lucide-react";
import { useWorkspace, useWorkspaceDiagrams } from "@/hooks/queries/use-workspace.queries";
import { CreateDiagramDialog } from "@/components/systemdesign-workspace/dialogs/create-diagram-dialog";
import { DiagramTable } from "@/components/systemdesign-workspace/tables/diagram-table";
import { DiagramListSkeleton } from "@/components/skeletons";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WorkspaceDetailPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { workspaceId } = use(params);
  const workspaceQuery = useWorkspace(workspaceId);
  const diagramsQuery = useWorkspaceDiagrams(workspaceId);
  const [searchQuery, setSearchQuery] = useState("");

  const diagrams = diagramsQuery.data || [];
  const filteredDiagrams = diagrams.filter((diagram) =>
    diagram.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <QueryGuard
      loading={workspaceQuery.isLoading}
      error={workspaceQuery.error}
      data={workspaceQuery.data}
      errorTitle={
        (workspaceQuery.error as any)?.response?.status === 403 || (workspaceQuery.error as any)?.response?.status === 404
          ? "Access Denied"
          : "System Error"
      }
      errorMessage={
        (workspaceQuery.error as any)?.response?.status === 403 || (workspaceQuery.error as any)?.response?.status === 404
          ? "You do not have access to this workspace folder, or the system link is invalid."
          : (workspaceQuery.error as any)?.message || "Failed to load workspace."
      }
      onRetry={() => {
        window.location.href = "/systemdesign/workspace";
      }}
      retryText="Back to Workspaces"
      skeleton={
        <div className="min-h-screen bg-background text-foreground py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header Block Placeholder */}
            <div className="animate-pulse space-y-3 border-b border-border/40 pb-6">
              <div className="h-9 w-64 bg-muted/60 rounded-lg" />
              <div className="h-4 w-full max-w-2xl bg-muted/40 rounded-md" />
            </div>
            <DiagramListSkeleton />
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-background text-foreground py-28 px-4 sm:px-6 lg:px-8">
        {/* Wrapper container for centered content layout */}
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Back Link Button */}
          <div className="flex items-center">
            <Button size="sm" asChild>
              <Link href="/systemdesign/workspace">
                <ArrowLeft className="size-3" />
                Back to Workspaces
              </Link>
            </Button>
          </div>

          {/* Header Block */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border/40 pb-6">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-2 truncate">
                <Folder className="h-8 w-8 text-primary shrink-0" />
                <span>{workspaceQuery.data?.name || "Workspace"}</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Manage and collaborate on your microservices designs, database schemas, and whiteboard flows inside this workspace folder.
              </p>
            </div>
            <div className="shrink-0 flex items-center">
              <CreateDiagramDialog workspaceId={workspaceId} />
            </div>
          </header>

          {/* Toolbar (Search filters) */}
          <div className="flex justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search diagrams by title..."
                className="pl-9 bg-card/40 border-border focus-visible:ring-primary"
              />
            </div>
            {diagrams.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Total diagrams: <b>{diagrams.length}</b></span>
              </div>
            )}
          </div>

          {/* QueryGuard wrapper to manage loading skeletons, error screens, and empty displays */}
          <QueryGuard
            loading={diagramsQuery.isLoading}
            error={diagramsQuery.error}
            data={diagramsQuery.data}
            skeleton={<DiagramListSkeleton />}
            emptyIcon={FileText}
            emptyTitle="No Diagrams Found"
            emptyMessage="Create a dynamic whiteboard diagram to start structuring your system architecture layout!"
            emptyAction={<CreateDiagramDialog workspaceId={workspaceId} />}
          >
            {searchQuery && filteredDiagrams.length === 0 ? (
              /* Search mismatch fallback empty state */
              <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-card/10 backdrop-blur-sm min-h-[320px]">
                <div className="p-4 rounded-full bg-muted/40 text-muted-foreground border border-border mb-4">
                  <FileText className="h-10 w-10 animate-pulse text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  No Matching Diagrams
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We couldn't find any diagram matching "{searchQuery}". Try editing your query.
                </p>
              </div>
            ) : (
              <DiagramTable workspaceId={workspaceId} diagrams={filteredDiagrams} />
            )}
          </QueryGuard>

        </div>
      </div>
    </QueryGuard>
  );
}
