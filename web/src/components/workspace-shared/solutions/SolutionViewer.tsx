"use client";

import React from "react";
import type { SolutionViewerProps } from "@/types/component.types";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Users,
  User,
  ArrowLeft,
  Edit,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProblemSolutions } from "@/hooks/queries/use-solution.queries";
import {
  useVoteSolution,
  useDeleteSolution,
} from "@/hooks/mutations/use-solution.mutations";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { SolutionList } from "./components/SolutionList";
import { SolutionDetail } from "./components/SolutionDetail";
import { OfficialSolution } from "./components/OfficialSolution";
import { SolutionsSkeleton } from "@/components/skeletons/WorkspaceSkeletons";
import { SolutionEditor } from "./SolutionEditor";
import { Button } from "@/components/ui/button";

// Import KaTeX CSS for math rendering
import "katex/dist/katex.min.css";

import { useWorkspaceStore, SolTab } from "@/store/workspace/use-workspace-store";

export const SolutionViewer: React.FC<SolutionViewerProps> = ({
  problemId,
  problemTitle,
  problemSlug,
  officialSolution,
  onAddSolution,
}) => {
  const { backendUser } = useCurrentUser();
  const currentUserId = backendUser?.id;
  
  const { 
    solTab: activeMainTab, 
    setSolTab: setActiveMainTab,
    selectedSolutionId,
    setSelectedSolutionId
  } = useWorkspaceStore();

  const {
    data: solutions,
    isLoading,
    error,
    refetch,
  } = useProblemSolutions(problemId);

  const { mutate: vote, isPending: isVoting } = useVoteSolution(problemId);
  const { mutate: deleteSolution, isPending: isDeleting } =
    useDeleteSolution(problemId);

  const [editingSolutionId, setEditingSolutionId] = React.useState<
    string | null
  >(null);

  // Ref to track if we've already attempted the auto-switch to community
  const hasAutoSwitched = React.useRef(false);

  // Pick the best default tab once solutions are loaded (if not available initially)
  React.useEffect(() => {
    // Check if we already have a specific solTab from URL/Store
    const hasExplicitTab = !!new URLSearchParams(window.location.search).get("solTab");
    
    // Only auto-switch once if we are currently on "official" and solutions exist
    if (!hasExplicitTab && !hasAutoSwitched.current && solutions && solutions.length > 0 && activeMainTab === "official") {
      setActiveMainTab("community");
      hasAutoSwitched.current = true;
    }
    // If solutions arrived (even if empty) we mark auto-switch as attempted
    if (solutions && !isLoading) {
      hasAutoSwitched.current = true;
    }
  }, [solutions, isLoading, activeMainTab, setActiveMainTab]);

  const selectedSolution = React.useMemo(() => {
    if (!selectedSolutionId || !solutions) return null;
    return solutions.find((s) => s.id === selectedSolutionId);
  }, [selectedSolutionId, solutions]);

  const mySolutions = React.useMemo(() => {
    if (!solutions || !currentUserId) return [];
    return solutions.filter((s) => s.userId === currentUserId);
  }, [solutions, currentUserId]);

  const handleVote = (solutionId: string, voteType: 1 | -1) => {
    vote({ solutionId, voteType });
  };

  const handleDelete = (solutionId: string) => {
    deleteSolution(solutionId, {
      onSuccess: () => {
        setSelectedSolutionId(null);
      },
    });
  };

  if (editingSolutionId && selectedSolution) {
    return (
      <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300 is-editing-mode">
        <div className="sticky top-0 z-20 bg-background flex items-center gap-2 border-b py-2 px-4">
          <Button
            size="icon"
            onClick={() => setEditingSolutionId(null)}
            className="size-6"
            title="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/90">
            Back to Solution
          </span>
        </div>

        <div className="pr-2 custom-scrollbar">
          <SolutionEditor
            problemId={problemId}
            problemTitle={problemTitle}
            problemSlug={problemSlug}
            solutionId={editingSolutionId}
            initialTitle={selectedSolution.title}
            initialContent={selectedSolution.content}
            onSuccess={() => {
              setEditingSolutionId(null);
              setSelectedSolutionId(null);
              setActiveMainTab("my-solutions");
            }}
          />
        </div>
      </div>
    );
  }

  if (selectedSolutionId && selectedSolution) {
    return (
      <SolutionDetail
        solution={selectedSolution}
        currentUserId={currentUserId}
        activeTab={activeMainTab || "community"}
        onBack={() => setSelectedSolutionId(null)}
        onVote={handleVote}
        onDelete={handleDelete}
        onEdit={(id) => setEditingSolutionId(id)}
        isVoting={isVoting}
        isDeleting={isDeleting}
      />
    );
  }

  // No more full-panel skeleton here, individual tabs handle their own loading via QueryGuard

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-500 pb-20 min-w-0">
      <Tabs
        value={activeMainTab}
        onValueChange={(val) => setActiveMainTab(val as SolTab)}
        className="w-full flex flex-col min-w-0"
      >
        <div className="sticky top-0 z-30 bg-background flex items-center justify-between mb-4 border-b border-border/30 shrink-0 px-4 py-2">
          <TabsList className="bg-transparent h-10 p-0 gap-6">
            <TabsTrigger
              value="official"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-10 px-0 text-xs font-bold transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="size-4" />
              <span className="hidden sm:block">Official</span>
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-10 px-0 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Users className="size-4" />
              <span className="hidden sm:block">Community</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-solutions"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-10 px-0 text-xs font-bold transition-all flex items-center gap-2"
            >
              <User className="size-4" />
              <span className="hidden sm:block">My Solutions</span>
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="mb-2 h-8 px-3" onClick={onAddSolution}>
            <Edit className="size-3.5" />
            <span>Add Solution</span>
          </Button>
        </div>

        <div className="custom-scrollbar min-w-0 p-4">
          <TabsContent
            value="official"
            className="mt-0 border-none outline-none animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-0 "
          >
            <OfficialSolution officialSolution={officialSolution} />
          </TabsContent>

          <TabsContent
            value="community"
            className="mt-0 border-none outline-none"
          >
            <SolutionList
              type="community"
              solutions={solutions || []}
              isLoading={isLoading}
              error={error}
              onSelect={(id) => setSelectedSolutionId(id)}
              onRetry={refetch}
            />
          </TabsContent>

          <TabsContent
            value="my-solutions"
            className="mt-0 border-none outline-none"
          >
            <SolutionList
              type="my-solutions"
              solutions={mySolutions}
              onSelect={(id) => setSelectedSolutionId(id)}
              onCreateNew={onAddSolution}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
