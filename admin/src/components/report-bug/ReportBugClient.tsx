"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { ReportBugList } from "./ReportBugList";
import { ReportBugEditor } from "./ReportBugEditor";
import { ReportBugViewer } from "./ReportBugViewer" 

export function ReportBugClient() {
  return (
    <AcademyDataPage
      title="Bug Reports"
      description="Manage bug reports, UI issues, and user feedback."
      itemNamePlural="Bug Reports"
      renderTable={(props) => <ReportBugList {...props} />}
      renderViewer={(props) => <ReportBugViewer {...props} />}
      renderEditor={(props) => <ReportBugEditor {...props} />}
    />
  );
}
