"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { ContestList } from "./ContestList";
import { ContestEditor } from "./ContestEditor";
import { ContestViewer } from "./ContestsViewer";

export function ContestClient() {
  return (
    <AcademyDataPage
      title="Contests"
      description="Manage upcoming, ongoing, and past contests."
      itemNamePlural="Contests"
      renderTable={(props) => <ContestList {...props} />}
      renderViewer={(props) => <ContestViewer {...props} />}
      renderEditor={(props) => <ContestEditor {...props} />}
    />
  );
}