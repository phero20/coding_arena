"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FolderKanban, Info, BookOpen, ArrowLeft } from "lucide-react";
import { useWorkspaces } from "@/hooks/queries/use-workspace.queries";
import { CreateWorkspaceDialog } from "@/components/systemdesign-workspace/dialogs/create-workspace-dialog";
import { WorkspaceTable } from "@/components/systemdesign-workspace/tables/workspace-table";
import { WorkspaceListSkeleton } from "@/components/skeletons";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WorkspacesPage() {
  const { data: workspaces = [], isLoading, error } = useWorkspaces();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-28 px-4 sm:px-6 lg:px-8">
      {/* Wrapper container for centered content layout */}
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Block */}
        <div className="flex items-center">
            <Button size="sm" asChild>
              <Link href="/systemdesign">
                <ArrowLeft className="size-3" />
                Back
              </Link>
            </Button>
          </div>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border/40 pb-6">
        
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-2">
              <FolderKanban className="h-8 w-8 text-primary shrink-0" />
              System Design & Architecture
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Create, manage, and collaborate on your microservices frameworks, cloud infrastructure designs, database UML charts, and flowchart diagrams.
            </p>
          </div>
          <div className="shrink-0 flex items-center">
            <CreateWorkspaceDialog />
          </div>
        </header>
        {/* Toolbar (Search filters) */}
        <div className="flex justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces by name..."
              className="pl-9 bg-card/40 border-border focus-visible:ring-primary"
            />
          </div>
          {workspaces.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">
              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Total workspaces: <b>{workspaces.length}</b></span>
            </div>
          )}
        </div>

        {/* QueryGuard wrapper to manage loading skeletons, error screens, and empty displays */}
        <QueryGuard
          loading={isLoading}
          error={error}
          data={workspaces}
          skeleton={<WorkspaceListSkeleton />}
          emptyIcon={FolderKanban}
          emptyTitle="No Workspaces Found"
          emptyMessage="Create a whiteboard workspace to start organizing your visual engineering plans!"
          emptyAction={<CreateWorkspaceDialog />}
        >
          {searchQuery && filteredWorkspaces.length === 0 ? (
            /* Search mismatch fallback empty state */
            <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-card/10 backdrop-blur-sm min-h-[320px]">
              <div className="p-4 rounded-full bg-muted/40 text-muted-foreground border border-border mb-4">
                <FolderKanban className="h-10 w-10 animate-pulse text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                No Matching Workspaces
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We couldn't find any workspace matching "{searchQuery}". Try editing your query.
              </p>
            </div>
          ) : (
            <WorkspaceTable workspaces={filteredWorkspaces} />
          )}
        </QueryGuard>

      </div>
    </div>
  );
}