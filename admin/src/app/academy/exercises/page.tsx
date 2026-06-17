"use client";

import { useState } from "react";
import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExercisesTable } from "@/components/academy/exercises/ExercisesTable";
import { ExerciseViewer } from "@/components/academy/exercises/ExerciseViewer";
import { ExerciseEditor } from "@/components/academy/exercises/ExerciseEditor";

export default function ExercisesPage() {
  const { tracks, isLoading: isLoadingTracks } = useAcademyTracks();
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>("");

  const trackSelector = (
    <div className="space-y-2">
      <Label>Select Track</Label>
      <Select value={selectedTrackSlug} onValueChange={setSelectedTrackSlug}>
        <SelectTrigger>
          <SelectValue placeholder={isLoadingTracks ? "Loading tracks..." : "Choose a track..."} />
        </SelectTrigger>
        <SelectContent>
          {tracks?.map((track: any) => (
            <SelectItem key={track.slug} value={track.slug}>
              {track.data?.title || track.slug}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AcademyDataPage
      title="Academy Exercises"
      description="Select a track below to manage its specific exercises."
      itemNamePlural="Exercises"
      headerAction={trackSelector}
      renderTable={(props) => <ExercisesTable trackSlug={selectedTrackSlug} {...props} />}
      renderViewer={(props) => <ExerciseViewer trackSlug={selectedTrackSlug} {...props} />}
      renderEditor={(props) => <ExerciseEditor trackSlug={selectedTrackSlug} {...props} />}
    />
  );
}
