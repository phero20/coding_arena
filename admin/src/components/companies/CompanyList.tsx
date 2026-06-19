import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { useCompanyAdmin } from "@/hooks/useCompany";
import { QueryState } from "@/components/ui/query-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyListProps {
  onEdit: (slug: string) => void;
  onView: (slug: string) => void;
}

export function CompanyList({
  onEdit,
  onView,
}: CompanyListProps) {
  const { companies, isLoading, isError, error, deleteCompany, isDeleting } = useCompanyAdmin();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies?.filter(company => {
    const query = searchQuery.toLowerCase();
    return (
      company.slug.toLowerCase().includes(query) ||
      company.name.toLowerCase().includes(query)
    );
  }) || [];

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const company = companies.find(c => c.slug === itemToDelete);
      if (company) {
        await deleteCompany(company.id);
      }
      setItemToDelete(null);
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading companies...">
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or slug..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {(!filteredCompanies || filteredCompanies.length === 0) ? (
          <EmptyState message="No matching companies found." />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Problems Linked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{company.slug}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{company.problem_ids?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(company.slug)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(company.slug)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setItemToDelete(company.slug)}
                          disabled={isDeleting && itemToDelete === company.slug}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company{" "}
              <span className="font-semibold text-foreground">"{itemToDelete}"</span>{" "}
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}
