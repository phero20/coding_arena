export const revalidate = 86400; // Cache lesson content for 24 hours

import { getSystemDesignTopicContent } from "@/services/queries/system-design.queries";
import { LearnMarkdown } from "@/components/systemdesign-workspace/learn/LearnMarkdown";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  let content = null;
  
  try {
    const data = await getSystemDesignTopicContent(resolvedParams.slug);
    content = data?.content;
  } catch (error) {
    console.error(`Failed to fetch content for topic ${resolvedParams.slug}:`, error);
  }

  return (
    <div className="space-y-6">
      <LearnMarkdown content={content || "> Content not found for this topic."} />
    </div>
  );
}
