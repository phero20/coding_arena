"use client";

import { useState } from "react";
import { Company } from "@/types/company";
import { Card } from "@/components/ui/card";
import { Building2, BriefcaseBusiness } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";

export function CompanyCard({ company }: { company: Company }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="group flex cursor-pointer flex-row items-center gap-6 overflow-hidden p-6 transition-all border-border bg-card duration-300 hover:border-primary/50 h-full">
      {/* Logo Side */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        {imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-1">
             <CompanyLogo className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
          </div>
        ) : (
          <img
            src={company.imageUrl}
            alt={company.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain drop-shadow-sm rounded-md"
            loading="lazy"
          />
        )}
      </div>

      {/* Content Side */}
      <div className="flex flex-1 flex-col min-w-0">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors hover:underline">
          {company.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
          <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 opacity-80" />
          <span className="truncate">Interview problems</span>
        </div>
      </div>
    </Card>
  );
}
