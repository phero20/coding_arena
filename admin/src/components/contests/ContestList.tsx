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
import { useContestAdmin } from "@/hooks/useContest";
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

interface ContestListProps {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ContestList({
  onView,
  onEdit,
}: ContestListProps) {
  const { contests, isLoading, isError, error, deleteContest, isDeleting } = useContestAdmin();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContests = contests?.filter(contest => {
    const query = searchQuery.toLowerCase();
    return (
      contest.title.toLowerCase().includes(query) ||
      contest.platform.toLowerCase().includes(query)
    );
  }) || [];

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteContest(itemToDelete);
      setItemToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "coding": return <Badge variant="default">{status}</Badge>;
      case "upcoming": return <Badge variant="outline">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading contests...">
      <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or platform..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {(!filteredContests || filteredContests.length === 0) ? (
          <EmptyState message="No matching contests found." />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContests.map((contest) => (
                  <TableRow key={contest.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{contest.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">clistId: {contest.clistId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{contest.platform}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(contest.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contest.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(contest.id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(contest.id)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setItemToDelete(contest.id)}
                          disabled={isDeleting && itemToDelete === contest.id}
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
              This action cannot be undone. This will permanently delete the contest.
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