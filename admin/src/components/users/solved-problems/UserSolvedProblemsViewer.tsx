import { useUserSolvedProblemsAdmin } from "@/hooks/useUserAdmin";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/ui/query-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { EmptyState } from "@/components/ui/empty-state";

interface UserSolvedProblemsViewerProps {
  userId: string;
}

export function UserSolvedProblemsViewer({ userId }: UserSolvedProblemsViewerProps) {
  const { solvedProblems, isLoading, isError, error, deleteSolvedProblem, isDeleting } = useUserSolvedProblemsAdmin(userId);
  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!solvedProblems) {
    return null;
  }

  const filteredProblems = solvedProblems.filter((item) =>
    item.problemId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deletingProblemId) {
      await deleteSolvedProblem({ id: userId, problemId: deletingProblemId });
      setDeletingProblemId(null);
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading solved problems...">
      <div className="flex flex-col h-full min-h-0 space-y-6 p-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              Solved Problems
            </h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {userId}
            </p>
          </div>
        </div>

        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by problem ID..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto min-h-0 space-y-4 pb-6">
          {filteredProblems.length === 0 ? (
            <EmptyState message={searchQuery ? "No problems match this search." : "No solved problems recorded for this user yet."} />
          ) : (
            <div className="rounded-md border flex-1 min-h-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Problem ID</TableHead>
                    <TableHead>Solved At</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.map((item) => (
                    <TableRow key={item.problemId}>
                      <TableCell className="font-medium">{item.problemId}</TableCell>
                      <TableCell>{new Date(item.solvedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button onClick={() => setDeletingProblemId(item.problemId)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
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
      </div>

      <AlertDialog open={!!deletingProblemId} onOpenChange={(open) => !open && setDeletingProblemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Solved Problem Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for problem <strong>{deletingProblemId}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryState>
  );
}
