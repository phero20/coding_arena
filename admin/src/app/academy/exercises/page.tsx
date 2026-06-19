"use client";

import { useState } from "react";
import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { EntitySelector } from "@/components/layout/EntitySelector";
import { Label } from "@/components/ui/label";
import { ExercisesTable } from "@/components/academy/exercises/ExercisesTable";
import { ExerciseViewer } from "@/components/academy/exercises/ExerciseViewer";
import { ExerciseEditor } from "@/components/academy/exercises/ExerciseEditor";

export default function ExercisesPage() {
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
      title="Academy Exercises"
      description="Select a track below to manage its specific exercises."
      itemNamePlural="Exercises"
      headerAction={trackSelector}
      renderTable={(props) => (
        <ExercisesTable trackSlug={selectedTrackSlug} {...props} />
      )}
      renderViewer={(props) => (
        <ExerciseViewer trackSlug={selectedTrackSlug} {...props} />
      )}
      renderEditor={(props) => (
        <ExerciseEditor trackSlug={selectedTrackSlug} {...props} />
      )}
    />
  );
}
