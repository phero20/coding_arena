import { Container } from "@/components/shared/Container";
import { PracticeProblemList } from "@/components/practice/PracticeProblemList";
import { problemsHubMeta } from "@/meta/problems/static";
import { Metadata } from "next";

export const metadata: Metadata = problemsHubMeta;

const PracticePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-28 pb-16">
        <Container className="space-y-8">
          <PracticeProblemList />
        </Container>
      </main>
    </div>
  );
};

export default PracticePage;
