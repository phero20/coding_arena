"use client";

import { useAcademyExercises } from "@/hooks/useAcademy";
import { AcademyDataTable } from "@/components/academy/shared/AcademyDataTable";

interface ExercisesTableProps {
  trackSlug: string;
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
}

export function ExercisesTable({ trackSlug, onEdit, onView }: ExercisesTableProps) {
  const { exercises, isLoading, isError, error, deleteExercise, isDeleting } = useAcademyExercises(trackSlug);

  if (!trackSlug) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-md mt-4">
        <p>Please select a track to view its exercises.</p>
      </div>
    );
  }

  // Map exerciseSlug to slug for the generic table
  const mappedData = exercises?.map((e: any) => ({
    ...e,
    slug: e.exerciseSlug,
  })) || [];

  return (
    <AcademyDataTable
      data={mappedData}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onEdit={onEdit}
      onView={onView}
      onDelete={deleteExercise}
      isDeleting={isDeleting}
      itemName="exercise"
      loadingMessage={`Loading exercises for ${trackSlug}...`}
      errorTitle="Failed to load exercises"
    />
  );
}
