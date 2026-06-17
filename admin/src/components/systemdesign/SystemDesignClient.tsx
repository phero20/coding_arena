"use client";

import { AcademyDataPage } from "@/components/academy/shared/AcademyDataPage";
import { TopicList } from "./TopicList";
import { TopicViewer } from "./TopicViewer";
import { TopicEditor } from "./TopicEditor";

export function SystemDesignClient() {
  return (
    <AcademyDataPage
      title="System Design"
      description="Manage the system design roadmap topics and their content."
      itemNamePlural="Topics"
      renderTable={(props) => <TopicList {...props} />}
      renderViewer={(props) => <TopicViewer {...props} />}
      renderEditor={(props) => <TopicEditor {...props} />}
    />
  );
}
