export const revalidate = 86400; // Cache each problem page for 24 hours

import { Suspense } from "react";
import { ProblemWorkspace } from "@/components/problem-editor/ProblemWorkspace";
import { getCachedProblem } from "@/meta/problems/dynamic";
import { ErrorDisplay } from "@/components/shared/StatusState";
import ProblemWorkspaceSkeleton from "./ProblemWorkspaceSkeleton";

export { generateProblemMetadata as generateMetadata } from "@/meta/problems/dynamic";

// Uses the shared cached problem fetch to reuse the same request promise as generateMetadata
const getProblem = async (slug: string) => {
  try {
    return await getCachedProblem(slug);
  } catch (error: any) {
    return null;
  }
};

type Props = {
  params: Promise<{ problemId: string }>;
};

async function ProblemData({ paramsPromise }: { paramsPromise: Promise<{ problemId: string }> }) {
  const resolvedParams = await paramsPromise;
  const problem = await getProblem(resolvedParams.problemId);

  if (!problem) {
    return (
      <ErrorDisplay
        title="Error Loading Problem"
        message="The problem you are looking for does not exist or could not be loaded."
      />
    );
  }

  return <ProblemWorkspace problem={problem} />;
}

export default function ProblemDetailPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<ProblemWorkspaceSkeleton />}>
        <ProblemData paramsPromise={params} />
      </Suspense>
    </main>
  );
}
