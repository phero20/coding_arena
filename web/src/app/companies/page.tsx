"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCompaniesQuery } from "@/hooks/queries/use-company.queries";
import { CompaniesHeader } from "@/components/companies/companies-header";
import { CompaniesToolbar } from "@/components/companies/companies-toolbar";
import { CompanyCard } from "@/components/companies/company-card";
import { CompaniesSkeleton } from "@/components/skeletons/companies-skeleton";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  const { data: companies = [], isLoading, error } = useCompaniesQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    return companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [companies, searchQuery]);

  // Curated list of famous companies to feature in the header
  const famousCompanyIds = [
    "google",
    "meta",
    "amazon",
    "apple",
    "microsoft",
    "oracle",
    "tcs",
    "infosys",
  ];

  // Find the company objects matching our curated list
  const sampleCompanies = famousCompanyIds
    .map(id => companies.find(c => c.slug === id || c.slug === id.toLowerCase()))
    .filter(Boolean)
    .slice(0, 8);
  
  // If still loading or error, we still want to render the skeleton structure,
  // but for the header, we can just pass empty arrays and 0 until loaded.
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Full-width container for Header */}
      <div className="w-full border-b border-border/90 pt-24 pb-8 lg:pt-28 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CompaniesHeader 
            totalCompanies={companies?.length || 0} 
            sampleCompanies={sampleCompanies as any} 
          />
        </div>
      </div>

      {/* Main Content Area - We will build the search and grid here next! */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-6">
          <CompaniesToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <QueryGuard
            loading={isLoading}
            error={error}
            data={filteredCompanies}
            skeleton={<CompaniesSkeleton />}
            errorTitle="Failed to load companies"
            emptyIcon={Building2}
            emptyTitle="No companies found"
            emptyMessage={`We couldn't find any companies matching "${searchQuery}". Try adjusting your search term.`}
          >
            {(data) => (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 pb-20">
                {data.map((company) => (
                  <Link key={company.id} href={`/companies/${company.slug}/problems`} className="block focus:outline-none h-full">
                    <CompanyCard company={company} />
                  </Link>
                ))}
              </div>
            )}
          </QueryGuard>
        </div>
      </div>
    </div>
  );
}
