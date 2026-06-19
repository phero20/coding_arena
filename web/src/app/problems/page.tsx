import { Suspense } from "react";
import { Container } from "@/components/shared/Container";
import { PracticeProblemList } from "@/components/practice/PracticeProblemList";
import { problemsHubMeta } from "@/meta/problems/static";
import { Metadata } from "next";
import { getProblems } from "@/services/queries/problem.queries";
import { ErrorDisplay } from "@/components/shared/StatusState";
import ProblemsPageSkeleton from "./ProblemsPageSkeleton";

export const metadata: Metadata = problemsHubMeta;

async function PracticeData() {
  let initialData;
  try {
    initialData = await getProblems(1, 20);
  } catch (error) {
    return (
      <div className="pt-28 min-h-screen bg-background">
        <ErrorDisplay 
          title="Problem Set Unavailable" 
          message="We couldn't retrieve the problems from the server. Please try again later."
        />
      </div>
    );
  }

  return (
    <Container className="space-y-8">
      <PracticeProblemList initialData={initialData} />
    </Container>
  );
}

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-28 pb-16">
        <Suspense fallback={<ProblemsPageSkeleton />}>
          <PracticeData />
        </Suspense>
      </main>
    </div>
  );
}
