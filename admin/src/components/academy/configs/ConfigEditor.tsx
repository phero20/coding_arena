import { useAcademyConfigs } from "@/hooks/useAcademy";
import { AcademyDataEditor } from "@/components/academy/shared/AcademyDataEditor";

interface ConfigEditorProps {
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConfigEditor({ slug, onSuccess, onCancel }: ConfigEditorProps) {
  const { configs, createConfig, updateConfig, isCreating, isUpdating } = useAcademyConfigs();
  
  const existingConfig = slug ? configs?.find((c: any) => c.slug === slug) : null;

  return (
    <AcademyDataEditor
      slug={slug}
      item={existingConfig}
      isCreating={isCreating}
      isUpdating={isUpdating}
      onCreate={createConfig}
      onUpdate={updateConfig}
      onSuccess={onSuccess}
      onCancel={onCancel}
      itemName="Config"
    />
  );
}
