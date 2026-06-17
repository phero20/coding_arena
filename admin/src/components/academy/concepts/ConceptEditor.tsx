"use client";

import { useAcademyConcepts } from "@/hooks/useAcademy";
import { AcademyDataEditor } from "@/components/academy/shared/AcademyDataEditor";

interface ConceptEditorProps {
  trackSlug: string;
  slug?: string; // This is the conceptSlug
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConceptEditor({ trackSlug, slug, onSuccess, onCancel }: ConceptEditorProps) {
  const { concepts, createConcept, updateConcept, isCreating, isUpdating } = useAcademyConcepts(trackSlug);
  
  const existingConcept = slug ? concepts?.find((c: any) => c.conceptSlug === slug) : null;
  const mappedConcept = existingConcept ? { ...existingConcept, slug: existingConcept.conceptSlug } : null;

  // The generic editor calls onCreate/onUpdate with { slug, data }
  const handleCreate = async ({ slug: newSlug, data }: { slug: string; data: any }) => {
    return createConcept({ conceptSlug: newSlug, data });
  };

  const handleUpdate = async ({ slug: updateSlug, data }: { slug: string; data: any }) => {
    return updateConcept({ conceptSlug: updateSlug, data });
  };

  if (!trackSlug) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-md mt-4">
        <p>Please select a track before creating a concept.</p>
      </div>
    );
  }

  return (
    <AcademyDataEditor
      slug={slug}
      item={mappedConcept}
      isCreating={isCreating}
      isUpdating={isUpdating}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onSuccess={onSuccess}
      onCancel={onCancel}
      itemName="Concept"
    />
  );
}
