"use client";

import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataTable } from "@/components/academy/shared/AcademyDataTable";

interface TracksTableProps {
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
}

export function TracksTable({ onEdit, onView }: TracksTableProps) {
  const { tracks, isLoading, isError, error, deleteTrack, isDeleting } = useAcademyTracks();

  return (
    <AcademyDataTable
      data={tracks}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onEdit={onEdit}
      onView={onView}
      onDelete={deleteTrack}
      isDeleting={isDeleting}
      itemName="track"
      loadingMessage="Loading tracks..."
      errorTitle="Failed to load tracks"
    />
  );
}
