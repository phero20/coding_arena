import { useAcademyTracks } from "@/hooks/useAcademy";
import { AcademyDataViewer } from "@/components/academy/shared/AcademyDataViewer";

interface TrackViewerProps {
  slug: string;
  onBack: () => void;
}

export function TrackViewer({ slug, onBack }: TrackViewerProps) {
  const { tracks, isLoading, isError, error } = useAcademyTracks();
  const track = tracks?.find((t: any) => t.slug === slug);

  return (
    <AcademyDataViewer
      slug={slug}
      item={track}
      isLoading={isLoading}
      isError={isError}
      error={error}
      itemName="Track"
      onBack={onBack}
    />
  );
}
