"use client";

import { useState } from "react";
import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { EntitySelector } from "@/components/layout/EntitySelector";
import { Label } from "@/components/ui/label";
import { ConceptsTable } from "@/components/academy/concepts/ConceptsTable";
import { ConceptViewer } from "@/components/academy/concepts/ConceptViewer";
import { ConceptEditor } from "@/components/academy/concepts/ConceptEditor";

export default function ConceptsPage() {
  const { tracks, isLoading: isLoadingTracks } = useAcademyTracks();
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>("");

  const trackSelector = (
    <EntitySelector
      label="Select Track"
      data={tracks || []}
      value={selectedTrackSlug}
      onValueChange={setSelectedTrackSlug}
      valueKey="slug"
      labelKey="data.title"
      placeholder="Choose a track..."
      searchPlaceholder="Search tracks..."
      emptyMessage="No tracks found."
      isLoading={isLoadingTracks}
    />
  );

  return (
    <AcademyDataPage
      title="Academy Concepts"
      description="Select a track below to manage its specific concepts."
      itemNamePlural="Concepts"
      headerAction={trackSelector}
      renderTable={(props) => (
        <ConceptsTable trackSlug={selectedTrackSlug} {...props} />
      )}
      renderViewer={(props) => (
        <ConceptViewer trackSlug={selectedTrackSlug} {...props} />
      )}
      renderEditor={(props) => (
        <ConceptEditor trackSlug={selectedTrackSlug} {...props} />
      )}
    />
  );
}
