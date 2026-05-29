"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrackExerciseQuery } from "@/hooks/queries/use-academy.queries";
import { AcademyWorkspace } from "@/components/academy/editor/AcademyWorkspace";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { WorkspaceSkeleton } from "@/components/skeletons/WorkspaceSkeletons";

export default function AcademyExercisePage() {
  const params = useParams<{ slug: string; exerciseSlug: string }>();
  const router = useRouter();

  const { data: exercise, isLoading, error } = useTrackExerciseQuery(
    params?.slug || "",
    params?.exerciseSlug || ""
  );

  return (
    <QueryGuard
      loading={isLoading}
      error={error}
      data={exercise}
      skeleton={<WorkspaceSkeleton />}
      errorTitle="Exercise Not Found"
      errorMessage="Failed to load the exercise environment. It might not exist."
      onRetry={() => router.push(`/academy/tracks/${params?.slug}?tab=practice`)}
      retryText="Back to Track"
      emptyTitle="Exercise Not Found"
      emptyMessage="This exercise could not be found."
    >
      {(exerciseData) => (
        <AcademyWorkspace exercise={exerciseData} trackSlug={params!.slug} />
      )}
    </QueryGuard>
  );
}
