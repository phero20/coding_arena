"use client";

import { useAcademyConfigs } from "@/hooks/useAcademy";
import { AcademyDataTable } from "@/components/academy/shared/AcademyDataTable";

interface ConfigsTableProps {
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
}

export function ConfigsTable({ onEdit, onView }: ConfigsTableProps) {
  const { configs, isLoading, isError, error, deleteConfig, isDeleting } = useAcademyConfigs();

  return (
    <AcademyDataTable
      data={configs}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onEdit={onEdit}
      onView={onView}
      onDelete={deleteConfig}
      isDeleting={isDeleting}
      itemName="config"
      loadingMessage="Loading configs..."
      errorTitle="Failed to load configs"
    />
  );
}
