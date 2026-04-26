"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ProblemWorkspace } from "@/components/problem-editor/ProblemWorkspace";
import { useProblemQuery } from "@/hooks/queries/use-problem.queries";
import { WorkspaceSkeleton } from "@/components/shared/Skeletons";
import { ErrorDisplay } from "@/components/shared/StatusState";

const ProblemDetailPage = () => {
  const { problemId } = useParams() as { problemId: string };
  const { data: problem, isLoading, error } = useProblemQuery(problemId);

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (error || !problem) {
    return (
      <ErrorDisplay
        title="Error Loading Problem"
        message={error?.message || "Something went wrong while fetching the problem details."}
        onRetry={() => window.location.reload()}
      />
    );
  }


  return (
    <main className="min-h-screen bg-background">
      <ProblemWorkspace problem={problem} />
    </main>
  );
};

export default ProblemDetailPage;
