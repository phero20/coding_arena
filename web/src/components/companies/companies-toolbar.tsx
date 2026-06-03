"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CompanyLogo } from "@/components/companies/CompanyLogo";

interface CompaniesToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalVisible: number;
}

export function CompaniesToolbar({ searchQuery, setSearchQuery, totalVisible }: CompaniesToolbarProps) {
  return (
    <div className="flex flex-col gap-4 justify-between pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CompanyLogo className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">Companies</h3>
        </div>
        <p className="text-sm text-muted-foreground">Pick a company and solve its problems.</p>
      </div>
      <div className="relative w-full">
         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        <Input
          placeholder="Search companies by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card/40 border-border focus-visible:ring-primary"
        />
      </div>
    </div>
  );
}
