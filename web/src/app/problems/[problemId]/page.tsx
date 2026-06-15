import { ProblemWorkspace } from "@/components/problem-editor/ProblemWorkspace";
import { getProblemBySlug } from "@/services/queries/problem.queries";
import { ErrorDisplay } from "@/components/shared/StatusState";
import { cache } from "react";

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

const ProblemDetailPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const problem = await getProblem(resolvedParams.problemId);

  if (!problem) {
    return (
      <ErrorDisplay
        title="Error Loading Problem"
        message="The problem you are looking for does not exist or could not be loaded."
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <ProblemWorkspace problem={problem} />
    </main>
  );
};

export default ProblemDetailPage;
