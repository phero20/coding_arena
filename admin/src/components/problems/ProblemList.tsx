"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Eye, FlaskConical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useProblemsAdmin, useProblemMutations } from "@/hooks/useProblems";
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
import type { Problem } from "@/services/problem.service";
import { Badge } from "../ui/badge";

interface ProblemListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onTest?: (id: string) => void;
}

export function ProblemList({ onEdit, onView, onTest }: ProblemListProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { problems, isLoading, isError, error } = useProblemsAdmin(page, limit, debouncedSearch);
  const { deleteProblem, isDeleting } = useProblemMutations();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteProblem(itemToDelete);
      setItemToDelete(null);
    }
  };

  // Since backend currently returns 0 for totalPages, we guess if we have next page by checking if we received a full limit
  const hasNextPage = problems.length === limit;
  const hasPrevPage = page > 1;

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4 p-1">
      <div className="relative max-w-sm shrink-0">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title, slug, or ID..."
          className="pl-8 bg-transparent"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <QueryState isLoading={isLoading && !problems.length} isError={isError} error={error} loadingMessage="Loading problems...">
        {(!problems || problems.length === 0) ? (
          <EmptyState message="No problems found." />
        ) : (
          <div className="rounded-md border flex-1 min-h-0 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => (
                  <TableRow key={problem.problem_id}>
                    <TableCell className="font-mono text-xs">{problem.problem_id}</TableCell>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{problem.problem_slug}</TableCell>
                    <TableCell>
                      <Badge className={`${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {problem.is_premium ? (
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs">Premium</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Free</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(problem.problem_id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(problem.problem_id)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {onTest && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onTest(problem.problem_id)}
                            title="Tests"
                          >
                            <FlaskConical className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setItemToDelete((problem as any)._id || problem.problem_id)}
                          disabled={isDeleting && itemToDelete === ((problem as any)._id || problem.problem_id)}
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

        <div className="flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            Showing Page {page}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!hasPrevPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </QueryState>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this problem from the database.
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
    </div>
  );
}
