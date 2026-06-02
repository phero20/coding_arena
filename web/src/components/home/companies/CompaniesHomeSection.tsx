"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompaniesHeader } from "@/components/companies/companies-header";
import { CompanyCard } from "@/components/companies/company-card";
import { Company } from "@/types/company";

// 8 Companies specifically for the top overlapping header
const headerCompanies: Company[] = [
  { id: "google", name: "Google", imageUrl: "/assets/companies-logos/google.png" },
  { id: "meta", name: "Meta", imageUrl: "/assets/companies-logos/meta.png" },
  { id: "amazon", name: "Amazon", imageUrl: "/assets/companies-logos/amazon.png" },
  { id: "apple", name: "Apple", imageUrl: "/assets/companies-logos/apple.png" },
  { id: "microsoft", name: "Microsoft", imageUrl: "/assets/companies-logos/microsoft.png" },
  { id: "oracle", name: "Oracle", imageUrl: "/assets/companies-logos/oracle.png" },
  { id: "tcs", name: "TCS", imageUrl: "/assets/companies-logos/tcs.png" },
  { id: "infosys", name: "Infosys", imageUrl: "/assets/companies-logos/infosys.png" },
];

// 12 Companies for the 3-row grid below
const gridCompanies: Company[] = [
  ...headerCompanies,
  { id: "netflix", name: "Netflix", imageUrl: "/assets/companies-logos/netflix.png" },
  { id: "uber", name: "Uber", imageUrl: "/assets/companies-logos/uber.png" },
  { id: "airbnb", name: "Airbnb", imageUrl: "/assets/companies-logos/airbnb.png" },
  { id: "adobe", name: "Adobe", imageUrl: "/assets/companies-logos/adobe.png" },
];

export const CompaniesHomeSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background py-20 sm:py-28 border-b">
      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col gap-16">

        {/* Header using the real CompaniesHeader component */}
        <CompaniesHeader totalCompanies={470} sampleCompanies={headerCompanies} />

        {/* 3-Row Grid with Bottom Overlay */}
        <div className="relative mt-8 pb-4 pointer-events-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1">
            {gridCompanies.map((company, i) => (
              <Link 
                href={`/companies/${company.id}/problems`} 
                key={company.id} 
                className={`block ${i >= 3 ? "hidden sm:block" : ""}`}
              >
                <CompanyCard company={company} />
              </Link>
            ))}
          </div>

          {/* Bottom Fade Overlay to create the "more items below" illusion */}
          <div className="absolute inset-x-0 bottom-0 h-96 bg-linear-to-t from-background via-background/40 to-background/10 z-20 pointer-events-none" />
        </div>

        {/* Text & CTA Button placed so it overlaps the fade */}
        <div className="flex flex-col items-center justify-center text-center relative z-20 -mt-16 gap-6">
          <p className="text-sm md:text-base text-muted-foreground">
            Explore 470+ top tech companies. Each profile features real <br className="hidden sm:block" /> interview questions that you can solve directly in our built-in editor while tracking your success stats over time.
          </p>
          <Button
            variant="link"
            className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
            asChild
          >
            <Link href="/companies">
              View all companies <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
};
