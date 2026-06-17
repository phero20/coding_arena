"use client";

import { useState } from "react";
import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConceptsTable } from "@/components/academy/concepts/ConceptsTable";
import { ConceptViewer } from "@/components/academy/concepts/ConceptViewer";
import { ConceptEditor } from "@/components/academy/concepts/ConceptEditor";

export default function ConceptsPage() {
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
      title="Academy Concepts"
      description="Select a track below to manage its specific concepts."
      itemNamePlural="Concepts"
      headerAction={trackSelector}
      renderTable={(props) => <ConceptsTable trackSlug={selectedTrackSlug} {...props} />}
      renderViewer={(props) => <ConceptViewer trackSlug={selectedTrackSlug} {...props} />}
      renderEditor={(props) => <ConceptEditor trackSlug={selectedTrackSlug} {...props} />}
    />
  );
}
