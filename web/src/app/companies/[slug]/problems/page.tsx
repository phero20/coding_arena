import { Suspense } from "react";
import { getCompanyProblems } from "@/services/queries/company.queries";
import { ProblemTable } from "@/components/practice/ProblemTable";
import { ArrowLeft } from "lucide-react";
import type { Problem } from "@/types/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CompanyLogoWithFallback } from "@/components/companies/CompanyLogoWithFallback";
import { ErrorDisplay } from "@/components/shared/StatusState";
import CompanyProblemsSkeleton from "./CompanyProblemsSkeleton";

export { generateCompanyMetadata as generateMetadata } from "@/meta/companies/dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function CompanyProblemsData({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const resolvedParams = await paramsPromise;
  const slug = resolvedParams.slug;

  let data;
  try {
    data = await getCompanyProblems(slug);
  } catch (error) {
    return (
      <ErrorDisplay 
        title="Failed to Load Problems" 
        message="We couldn't retrieve the interview problems for this company. Please try again later."
      />
    );
  }

  const company = data?.company;
  const companyProblems = data?.problems || [];

  // Map the static CompanyProblem data to the standard Problem interface used by the Table
  // Note: Backend might send full Problem objects, so we spread the original and safely handle the slug.
  const mappedProblems = companyProblems.map((cp: any) => ({
    ...cp,
    problem_id: cp.problem_id, 
    problem_slug: cp.problem_slug || cp.slug || "",
    title: cp.title,
    difficulty: cp.difficulty,
    topics: cp.topics || [],
    is_premium: cp.is_premium,
    // Fill required dummy fields for Problem interface if they are missing
    description: cp.description || "",
    examples: cp.examples || [],
    constraints: cp.constraints || [],
    follow_ups: cp.follow_ups || [],
    hints: cp.hints || [],
    code_snippets: cp.code_snippets || {},
    function_signature: cp.function_signature || { name: "", return_type: "", params: [] },
    createdAt: cp.createdAt || "",
    updatedAt: cp.updatedAt || "",
  })) as Problem[];

  return (
    <>
      {/* Header Section */}
      <Link href="/companies">
        <Button size="sm"><ArrowLeft /> Companies</Button>
      </Link>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-6 border-b border-border/40">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center">
          <CompanyLogoWithFallback imageUrl={company?.imageUrl} name={company?.name || "Company"} />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {company ? company.name : "Company"} Problems
          </h1>
          <p className="text-muted-foreground">
            Master the most frequently asked interview questions for this company.
          </p>
        </div>
      </div>

      {/* Problem Table */}
      <div className="w-full">
        <ProblemTable 
          problems={mappedProblems} 
          isLoading={false} 
          error={null}
        />
      </div>
    </>
  );
}

export default function CompanyProblemsPage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 w-full">
      <Suspense fallback={<CompanyProblemsSkeleton />}>
        <CompanyProblemsData paramsPromise={params} />
      </Suspense>
    </div>
  );
}
