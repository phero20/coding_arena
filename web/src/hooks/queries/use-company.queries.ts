"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanies, getCompanyProblems } from "@/services/queries/company.queries";
import type { Company, CompanyProblemsResponse } from "@/types/company";

/**
 * Hook to fetch the master list of all companies.
 */
export function useCompaniesQuery() {
  return useQuery<Company[], Error>({
    queryKey: ["companies-list"],
    queryFn: getCompanies,
    staleTime: Infinity, // The list of companies rarely changes
  });
}

/**
 * Hook to fetch the specific problems for a company.
 */
export function useCompanyProblemsQuery(slug: string) {
  return useQuery<CompanyProblemsResponse, Error>({
    queryKey: ["company-problems", slug],
    queryFn: () => getCompanyProblems(slug),
    staleTime: Infinity, // The static questions won't change during the session
    enabled: !!slug, // Only run the query if a slug is provided
  });
}
