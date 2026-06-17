"use client";

import { useAcademyExercises } from "@/hooks/useAcademy";
import { AcademyDataEditor } from "@/components/academy/shared/AcademyDataEditor";

interface ExerciseEditorProps {
  trackSlug: string;
  slug?: string; // This is the exerciseSlug
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExerciseEditor({ trackSlug, slug, onSuccess, onCancel }: ExerciseEditorProps) {
  const { exercises, createExercise, updateExercise, isCreating, isUpdating } = useAcademyExercises(trackSlug);
  
  const existingExercise = slug ? exercises?.find((e: any) => e.exerciseSlug === slug) : null;
  const mappedExercise = existingExercise ? { ...existingExercise, slug: existingExercise.exerciseSlug } : null;

  // The generic editor calls onCreate/onUpdate with { slug, data }
  const handleCreate = async ({ slug: newSlug, data }: { slug: string; data: any }) => {
    return createExercise({ exerciseSlug: newSlug, data });
  };

  const handleUpdate = async ({ slug: updateSlug, data }: { slug: string; data: any }) => {
    return updateExercise({ exerciseSlug: updateSlug, data });
  };

  if (!trackSlug) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-md mt-4">
        <p>Please select a track before creating an exercise.</p>
      </div>
    );
  }

  return (
    <AcademyDataEditor
      slug={slug}
      item={mappedExercise}
      isCreating={isCreating}
      isUpdating={isUpdating}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onSuccess={onSuccess}
      onCancel={onCancel}
      itemName="Exercise"
    />
  );
}
