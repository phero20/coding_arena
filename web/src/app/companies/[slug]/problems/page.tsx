"use client";

import { useParams } from "next/navigation";
import { useCompanyProblemsQuery, useCompaniesQuery } from "@/hooks/queries/use-company.queries";
import { ProblemTable } from "@/components/practice/ProblemTable";
import { ArrowLeft, Building2 } from "lucide-react";
import { useState } from "react";
import type { Problem } from "@/types/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CompanyLogo } from "@/components/companies/CompanyLogo";

export default function CompanyProblemsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [imgError, setImgError] = useState(false);

  const { data: companies = [] } = useCompaniesQuery();
  const company = companies.find((c) => c.id === slug || c.id === slug.toLowerCase());

  const { data: companyProblems = [], isLoading, error } = useCompanyProblemsQuery(slug);

  // Map the static CompanyProblem data to the standard Problem interface used by the Table
  const mappedProblems = companyProblems.map((cp) => ({
    problem_id: cp.problem_id, // Using slug to match user solved problems if backend uses slugs
    problem_slug: cp.slug || "",
    title: cp.title,
    difficulty: cp.difficulty === "EASY" ? "Easy" : cp.difficulty === "MEDIUM" ? "Medium" : "Hard",
    topics: cp.topics || [],
    
    // Fill required dummy fields for Problem interface
    description: "",
    examples: [],
    constraints: [],
    follow_ups: [],
    hints: [],
    code_snippets: {},
    function_signature: { name: "", return_type: "", params: [] },
    createdAt: "",
    updatedAt: "",
  })) as Problem[];

  return (
    <div className="flex min-h-screen flex-col bg-background py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header Section */}
      <Link href="/companies"><Button size="sm"><ArrowLeft /> Companies</Button></Link>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 pb-6 border-b border-border/40">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl">
          {company?.imageUrl && !imgError ? (
            <img 
              src={company.imageUrl} 
              alt={company.name} 
              onError={() => setImgError(true)}
              className="h-full w-full object-contain rounded-md"
            />
          ) : (
             <CompanyLogo className="w-16 h-16 shrink-0" />
          )}
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
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  );
}
