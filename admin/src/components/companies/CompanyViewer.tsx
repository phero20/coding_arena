import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { QueryState } from "@/components/ui/query-state";
import { useCompanyAdmin } from "@/hooks/useCompany";

interface CompanyViewerProps {
  slug: string;
  onBack: () => void;
}

export function CompanyViewer({ slug, onBack }: CompanyViewerProps) {
  const { companies, isLoading, isError, error } = useCompanyAdmin();

  const company = companies.find(c => c.slug === slug);

  return (
    <QueryState
      isLoading={isLoading}
      loadingMessage="Loading company details..."
      isError={isError}
      error={error}
      errorTitle="Failed to load company"
    >
      {!company ? (
        <div className="space-y-4">
          <p className="text-destructive font-medium">Company not found.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
          <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon-lg" onClick={onBack} title="Go Back" className="gap-1 rounded-full shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-medium tracking-tight">
                  Company Information: {company.slug}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Name: {company.name} | Linked Problems: {company.problem_ids?.length || 0}
                </p>
              </div>
          </div>
        </div>

          <div className="rounded-md border bg-muted/20 p-6 flex-1 overflow-auto min-h-0">
            <h4 className="text-sm font-semibold mb-3">Linked Problems ({company.problem_ids?.length || 0})</h4>
            {company.problem_ids && company.problem_ids.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {company.problem_ids.map(id => (
                  <span key={id} className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                    {id}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No problems linked yet.</p>
            )}
          </div>
        </div>
      )}
    </QueryState>
  );
}
