"use client";

import { useAcademyExercises } from "@/hooks/useAcademy";
import { AcademyDataViewer } from "@/components/academy/shared/AcademyDataViewer";

interface ExerciseViewerProps {
  trackSlug: string;
  slug: string; // This is the exerciseSlug
  onBack: () => void;
}

export function ExerciseViewer({ trackSlug, slug, onBack }: ExerciseViewerProps) {
  const { exercises, isLoading, isError, error } = useAcademyExercises(trackSlug);
  
  const exercise = exercises?.find((e: any) => e.exerciseSlug === slug);
  const mappedExercise = exercise ? { ...exercise, slug: exercise.exerciseSlug } : null;

  if (!trackSlug) return null;

  return (
    <AcademyDataViewer
      slug={slug}
      item={mappedExercise}
      isLoading={isLoading}
      isError={isError}
      error={error}
      itemName="Exercise"
      onBack={onBack}
    />
  );
}
