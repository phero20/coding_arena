import { getCompanies } from "@/services/queries/company.queries";
import { CompaniesHeader } from "@/components/companies/companies-header";
import { CompaniesClient } from "@/components/companies/CompaniesClient";
import { ErrorDisplay } from "@/components/shared/StatusState";


export default async function CompaniesPage() {
  let companies = [];
  
  try {
    companies = await getCompanies();
  } catch (error) {
    return (
      <ErrorDisplay 
        title="Failed to Load Companies" 
        message="We couldn't retrieve the companies list from the server. Please try again later."
      />
    );
  }

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Full-width container for Header */}
      <div className="w-full border-b border-border/90 pt-24 pb-8 lg:pt-28 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CompaniesHeader 
            totalCompanies={companies.length} 
            sampleCompanies={sampleCompanies as any} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <CompaniesClient companies={companies} />
      </div>
    </div>
  );
}
