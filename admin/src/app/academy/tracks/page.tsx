"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { TracksTable } from "@/components/academy/tracks/TracksTable";
import { TrackEditor } from "@/components/academy/tracks/TrackEditor";
import { TrackViewer } from "@/components/academy/tracks/TrackViewer";

export default function TracksPage() {
  return (
    <AcademyDataPage
      title="Academy Tracks"
      description="Manage academy tracks and their configurations."
      itemNamePlural="Tracks"
      renderTable={(props) => <TracksTable {...props} />}
      renderViewer={(props) => <TrackViewer {...props} />}
      renderEditor={(props) => <TrackEditor {...props} />}
    />
  );
}
