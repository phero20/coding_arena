"use client";

import { use } from "react";
import { useSystemDesignTopicContentQuery } from "@/hooks/queries/use-system-design.queries";
import { LearnMarkdown } from "@/components/systemdesign-workspace/learn/LearnMarkdown";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { LearnContentSkeleton } from "@/components/skeletons/SystemDesignLearnSkeletons";

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const query = useSystemDesignTopicContentQuery(resolvedParams.slug);

  return (
    <div className="space-y-6">
      <QueryGuard
        loading={query.isLoading}
        error={query.error}
        errorTitle="Unexpected Error Occured"
        data={query.data}
        skeleton={<LearnContentSkeleton />}
        emptyMessage="Topic content could not be found."
      >
        {(topicData) => (
          <LearnMarkdown content={topicData?.content || "> Content not found for this topic."} />
        )}
      </QueryGuard>
    </div>
  );
}
