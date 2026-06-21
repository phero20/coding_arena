"use client";

import { useUserSolutionsAdmin } from "@/hooks/useUserAdmin";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Eye, ChevronLeft, Copy, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface UserSolutionsViewerProps {
  userId: string;
}

export function UserSolutionsViewer({ userId }: UserSolutionsViewerProps) {
  const { solutions, isLoading, isError, error, deleteSolution, isDeleting } = useUserSolutionsAdmin(userId);
  const [deletingSolutionId, setDeletingSolutionId] = useState<string | null>(null);
  const [viewingSolution, setViewingSolution] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  if (!solutions) {
    return null;
  }

  const handleCopy = () => {
    if (!viewingSolution) return;
    navigator.clipboard.writeText(viewingSolution.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSolutions = solutions.filter((item: any) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.problemTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deletingSolutionId) {
      await deleteSolution({ id: userId, solutionId: deletingSolutionId });
      setDeletingSolutionId(null);
    }
  };

  if (viewingSolution) {
    return (
      <div className="flex flex-col h-full min-h-0 space-y-4 p-2">
        <div className="flex items-center justify-between pb-4 sticky top-0 bg-transparent z-10 pt-4 -mt-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="icon-lg" onClick={() => setViewingSolution(null)} title="Go Back" className="gap-1 rounded-full">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-lg font-medium tracking-tight">
                Solution: {viewingSolution.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Problem: {viewingSolution.problemTitle || viewingSolution.problemId} | Language: {viewingSolution.language || "Unknown"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="lg" onClick={handleCopy} className="gap-2 px-4">
            {copied ? (
              <Check className="text-green-500" />
            ) : (
              <Copy />
            )}
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </div>

        <div className="rounded-md border bg-muted/20 p-4 flex-1 overflow-auto min-h-0 relative">
          <pre className="text-sm font-mono whitespace-pre-wrap break-all">
            {viewingSolution.content}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading solutions...">
      <div className="flex flex-col h-full min-h-0 space-y-6 p-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              User Solutions
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
            placeholder="Search by title or problem..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto min-h-0 space-y-4 pb-6">
          {filteredSolutions.length === 0 ? (
            <EmptyState message={searchQuery ? "No solutions match this search." : "No solutions published by this user yet."} />
          ) : (
            <div className="rounded-md border flex-1 min-h-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Problem</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSolutions.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={item.title}>
                        {item.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.problemTitle || item.problemId}
                      </TableCell>
                      <TableCell>
                        {item.language ? <Badge variant="outline">{item.language}</Badge> : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="text-emerald-500 font-medium">+{item.upvotes}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-rose-500 font-medium">-{item.downvotes}</span>
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button onClick={() => setViewingSolution(item)} variant="ghost" size="icon" title="View Solution">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => setDeletingSolutionId(item.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Delete Solution">
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

      <AlertDialog open={!!deletingSolutionId} onOpenChange={(open) => !open && setDeletingSolutionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Solution?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this solution? This action cannot be undone.
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
