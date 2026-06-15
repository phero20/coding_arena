"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CompaniesToolbar } from "@/components/companies/companies-toolbar";
import { CompanyCard } from "@/components/companies/company-card";
import { Building2 } from "lucide-react";

import { type Company } from "@/types/company";

interface CompaniesClientProps {
  companies: Company[];
}

export function CompaniesClient({ companies }: CompaniesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    return companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [companies, searchQuery]);

  return (
    <div className="space-y-6">
      <CompaniesToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 pb-20">
          {filteredCompanies.map((company) => (
            <Link key={company.id} href={`/companies/${company.slug}/problems`} className="block focus:outline-none h-full">
              <CompanyCard company={company as any} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center mt-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
            No companies found
          </h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any companies matching "{searchQuery}". Try adjusting your search term.
          </p>
        </div>
      )}
    </div>
  );
}
