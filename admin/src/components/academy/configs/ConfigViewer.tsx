import { useAcademyConfigs } from "@/hooks/useAcademy";
import { AcademyDataViewer } from "@/components/academy/shared/AcademyDataViewer";

interface ConfigViewerProps {
  slug: string;
  onBack: () => void;
}

export function ConfigViewer({ slug, onBack }: ConfigViewerProps) {
  const { configs, isLoading, isError, error } = useAcademyConfigs();
  const config = configs?.find((c: any) => c.slug === slug);

  return (
    <AcademyDataViewer
      slug={slug}
      item={config}
      isLoading={isLoading}
      isError={isError}
      error={error}
      itemName="Config"
      onBack={onBack}
    />
  );
}
