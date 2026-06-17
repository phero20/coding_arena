"use client";

import { useAcademyConcepts } from "@/hooks/useAcademy";
import { AcademyDataViewer } from "@/components/academy/shared/AcademyDataViewer";

interface ConceptViewerProps {
  trackSlug: string;
  slug: string; // This is the conceptSlug
  onBack: () => void;
}

export function ConceptViewer({ trackSlug, slug, onBack }: ConceptViewerProps) {
  const { concepts, isLoading, isError, error } = useAcademyConcepts(trackSlug);
  
  const concept = concepts?.find((c: any) => c.conceptSlug === slug);
  const mappedConcept = concept ? { ...concept, slug: concept.conceptSlug } : null;

  if (!trackSlug) return null;

  return (
    <AcademyDataViewer
      slug={slug}
      item={mappedConcept}
      isLoading={isLoading}
      isError={isError}
      error={error}
      itemName="Concept"
      onBack={onBack}
    />
  );
}
