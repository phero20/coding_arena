"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { CompanyList } from "./CompanyList";
import { CompanyViewer } from "./CompanyViewer";
import { CompanyEditor } from "./CompanyEditor";

export function CompanyClient() {
  return (
    <AcademyDataPage
      title="Companies"
      description="Manage companies and their associated problems."
      itemNamePlural="Companies"
      renderTable={(props) => <CompanyList {...props} />}
      renderViewer={(props) => <CompanyViewer {...props} />}
      renderEditor={(props) => <CompanyEditor {...props} />}
    />
  );
}
