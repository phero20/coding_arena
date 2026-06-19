import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Company } from "@/services/company.service";
import { useCompanyAdmin } from "@/hooks/useCompany";
import { Loader2, ChevronLeft, Save } from "lucide-react";

interface CompanyEditorProps {
  slug?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CompanyEditor({ slug, onSuccess, onCancel }: CompanyEditorProps) {
  const { companies, createCompany, updateCompany, isCreating, isUpdating, isLoading } = useCompanyAdmin();
  
  const initialData = slug ? companies.find(c => c.slug === slug) : null;
  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState<Partial<Company>>({
    slug: "",
    name: "",
    imageUrl: "",
    problem_ids: [],
  });

  const [problemsInput, setProblemsInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        slug: initialData.slug,
        name: initialData.name,
        imageUrl: initialData.imageUrl || "",
        problem_ids: initialData.problem_ids || [],
      });
      setProblemsInput((initialData.problem_ids || []).join(", "));
    } else {
      setFormData({
        slug: "",
        name: "",
        imageUrl: "",
        problem_ids: [],
      });
      setProblemsInput("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedProblemIds = problemsInput
        .split(",")
        .map(id => id.trim())
        .filter(id => id.length > 0);

      const payload = {
        ...formData,
        problem_ids: parsedProblemIds,
      };

      if (initialData) {
        await updateCompany({ id: initialData.id, payload });
      } else {
        await createCompany(payload);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading && slug && !initialData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (slug && !initialData && !isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-destructive font-medium">Company not found.</p>
        <Button onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 space-y-6 p-1">
      <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onCancel}
            title="Go Back"
            className="gap-1 rounded-full shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium tracking-tight">
              {initialData ? `Edit Company: ${initialData.slug}` : `Create New Company`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {initialData
                ? "Update the details of the company."
                : "Add a new company to the system."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="submit" disabled={isSubmitting} size="lg" className="px-6 gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Company"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 rounded-md border bg-muted/20 p-6">
        <div className="grid gap-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Google"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
           <div className="space-y-2 flex flex-col">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              placeholder="e.g. google"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          </div>
          
           <div className="space-y-2 flex flex-col">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="text"
              placeholder="/assets/company/logo.png"
              value={formData.imageUrl || ""}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2 flex flex-col min-h-[150px]">
            <Label htmlFor="problemsInput">Problem IDs (Comma separated)</Label>
            <Textarea
              id="problemsInput"
              placeholder="9, 17, 18, 1"
              className="flex-1 font-mono text-sm resize-y min-h-[100px]"
              value={problemsInput}
              onChange={(e) => setProblemsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the exact problem slugs, separated by commas.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
