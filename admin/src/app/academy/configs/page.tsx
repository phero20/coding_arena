"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { ConfigsTable } from "@/components/academy/configs/ConfigsTable";
import { ConfigEditor } from "@/components/academy/configs/ConfigEditor";
import { ConfigViewer } from "@/components/academy/configs/ConfigViewer";

export default function ConfigsPage() {
  return (
    <AcademyDataPage
      title="Academy Configs"
      description="Manage global settings and configurations for the academy."
      itemNamePlural="Configs"
      renderTable={(props) => <ConfigsTable {...props} />}
      renderViewer={(props) => <ConfigViewer {...props} />}
      renderEditor={(props) => <ConfigEditor {...props} />}
    />
  );
}
