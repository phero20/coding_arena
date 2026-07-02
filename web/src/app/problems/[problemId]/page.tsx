export const revalidate = 86400; // Cache each problem page for 24 hours

import { Suspense } from "react";
import { ProblemWorkspace } from "@/components/problem-editor/ProblemWorkspace";
import { getProblemBySlug } from "@/services/queries/problem.queries";
import { ErrorDisplay } from "@/components/shared/StatusState";
import { cache } from "react";
import ProblemWorkspaceSkeleton from "./ProblemWorkspaceSkeleton";

export { generateProblemMetadata as generateMetadata } from "@/meta/problems/dynamic";

// Cache the problem fetch to avoid duplicate DB calls between generateMetadata and the Page
const getProblem = cache(async (slug: string) => {
  try {
    return await getProblemBySlug(slug);
  } catch (error: any) {
    return null;
  }
});

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
