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
import { Eye, Edit, Trash2 } from "lucide-react";
import { useReportBugAdmin } from "@/hooks/useReportBug";
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
import { Badge } from "@/components/ui/badge";

interface ReportBugListProps {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ReportBugList({ onView, onEdit }: ReportBugListProps) {
  const { reports, isLoading, isError, error, deleteReport, isDeleting } = useReportBugAdmin();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports?.filter(report => {
    const query = searchQuery.toLowerCase();
    return (
      report.title.toLowerCase().includes(query) ||
      report.type.toLowerCase().includes(query) ||
      report.status.toLowerCase().includes(query)
    );
  }) || [];

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteReport(itemToDelete);
      setItemToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return <Badge variant="destructive">{status}</Badge>;
      case "in_progress": return <Badge variant="default">{status}</Badge>;
      case "resolved": return <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{status}</Badge>;
      case "closed": return <Badge variant="outline">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug": return <Badge variant="destructive">{type}</Badge>;
      case "ui": return <Badge variant="secondary">{type}</Badge>;
      case "feature": return <Badge variant="default">{type}</Badge>;
      case "feedback": return <Badge variant="outline">{type}</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading bug reports...">
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, type, or status..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {(!filteredReports || filteredReports.length === 0) ? (
          <EmptyState message="No matching bug reports found." />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{report.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{report.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(report.type)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(report.id)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(report.id)}
                          title="Edit Report"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setItemToDelete(report.id)}
                          title="Delete Report"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this bug report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}
