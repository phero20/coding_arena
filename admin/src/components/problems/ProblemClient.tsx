"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { ProblemList } from "./ProblemList";
import { ProblemViewer } from "./ProblemViewer";
import { ProblemEditor } from "./ProblemEditor";
import { ProblemTestEditor } from "./ProblemTestEditor";

export function ProblemClient() {
  return (
    <AcademyDataPage
      title="Problems"
      description="Manage coding problems. Server-side search and pagination are active."
      itemNamePlural="Problems"
      renderTable={(props) => <ProblemList {...props} />}
      renderViewer={(props) => <ProblemViewer {...props} />}
      renderEditor={(props) => <ProblemEditor {...props} />}
      renderTests={(props) => <ProblemTestEditor {...props} />}
    />
  );
}
