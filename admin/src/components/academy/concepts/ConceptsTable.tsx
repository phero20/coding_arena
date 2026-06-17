"use client";

import { useAcademyConcepts } from "@/hooks/useAcademy";
import { AcademyDataTable } from "@/components/academy/shared/AcademyDataTable";

interface ConceptsTableProps {
  trackSlug: string;
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
}

export function ConceptsTable({ trackSlug, onEdit, onView }: ConceptsTableProps) {
  const { concepts, isLoading, isError, error, deleteConcept, isDeleting } = useAcademyConcepts(trackSlug);

  if (!trackSlug) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-md mt-4">
        <p>Please select a track from the sidebar to view its concepts.</p>
      </div>
    );
  }

  // Map conceptSlug to slug for the generic table
  const mappedData = concepts?.map((c: any) => ({
    ...c,
    slug: c.conceptSlug,
  })) || [];

  return (
    <AcademyDataTable
      data={mappedData}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onEdit={onEdit}
      onView={onView}
      onDelete={deleteConcept}
      isDeleting={isDeleting}
      itemName="concept"
      loadingMessage={`Loading concepts for ${trackSlug}...`}
      errorTitle="Failed to load concepts"
    />
  );
}
