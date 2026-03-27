"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProblemWorkspace } from "@/components/problem-editor/ProblemWorkspace";
import { useProblem } from "@/hooks/use-problem";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

const ProblemDetailPage = () => {
  const { problemId } = useParams() as { problemId: string };
  const { problem, isLoading, error } = useProblem(problemId);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex flex-col p-4 space-y-4">
        <div className="flex gap-4 h-12">
          <Skeleton className="h-full w-48 bg-muted/20" />
          <Skeleton className="h-full w-32 bg-muted/20" />
        </div>
        <div className="flex-1 flex gap-4">
          <Skeleton className="h-full flex-1 bg-muted/10" />
          <Skeleton className="h-full flex-[1.5] bg-muted/5" />
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-8 border border-destructive/20 rounded-2xl bg-destructive/5 backdrop-blur-xl">
          <AlertCircle className="size-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Error Loading Problem</h1>
          <p className="text-muted-foreground text-sm">
            {error?.message ||
              "Something went wrong while fetching the problem details."}
          </p>
          <div className="pt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <ProblemWorkspace problem={problem} />
    </main>
  );
};

export default ProblemDetailPage;
