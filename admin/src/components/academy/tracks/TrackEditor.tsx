import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataEditor } from "@/components/academy/shared/AcademyDataEditor";

interface TrackEditorProps {
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TrackEditor({ slug, onSuccess, onCancel }: TrackEditorProps) {
  const { tracks, createTrack, updateTrack, isCreating, isUpdating } = useAcademyTracks();
  
  const existingTrack = slug ? tracks?.find((t: any) => t.slug === slug) : null;

  return (
    <AcademyDataEditor
      slug={slug}
      item={existingTrack}
      isCreating={isCreating}
      isUpdating={isUpdating}
      onCreate={createTrack}
      onUpdate={updateTrack}
      onSuccess={onSuccess}
      onCancel={onCancel}
      itemName="Track"
    />
  );
}
