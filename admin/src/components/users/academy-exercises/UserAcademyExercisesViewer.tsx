import { useUserAcademyExercisesAdmin } from "@/hooks/useUserAdmin";
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
import type { UserAcademyExercise } from "@/types/user";

interface UserAcademyExercisesViewerProps {
  userId: string;
}

export function UserAcademyExercisesViewer({ userId }: UserAcademyExercisesViewerProps) {
  const { academyExercises, isLoading, isError, error, deleteAcademyExercise, isDeleting } = useUserAcademyExercisesAdmin(userId);
  const [deletingExercise, setDeletingExercise] = useState<UserAcademyExercise | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!academyExercises) {
    return null;
  }

  const filteredExercises = academyExercises.filter((item) =>
    item.exerciseSlug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.trackSlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deletingExercise) {
      await deleteAcademyExercise({ id: userId, trackSlug: deletingExercise.trackSlug, exerciseSlug: deletingExercise.exerciseSlug });
      setDeletingExercise(null);
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading academy exercises...">
      <div className="flex flex-col h-full min-h-0 space-y-6 p-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              Academy Exercises
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
            placeholder="Search by track or exercise slug..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto min-h-0 space-y-4 pb-6">
          {filteredExercises.length === 0 ? (
            <EmptyState message={searchQuery ? "No exercises match this search." : "No academy exercises recorded for this user yet."} />
          ) : (
            <div className="rounded-md border flex-1 min-h-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Track Slug</TableHead>
                    <TableHead>Exercise Slug</TableHead>
                    <TableHead>Solved At</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExercises.map((item) => (
                    <TableRow key={`${item.trackSlug}-${item.exerciseSlug}`}>
                      <TableCell className="font-medium">{item.trackSlug}</TableCell>
                      <TableCell className="font-medium">{item.exerciseSlug}</TableCell>
                      <TableCell>{new Date(item.solvedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button onClick={() => setDeletingExercise(item)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
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

      <AlertDialog open={!!deletingExercise} onOpenChange={(open) => !open && setDeletingExercise(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academy Exercise Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for exercise <strong>{deletingExercise?.exerciseSlug}</strong> in track <strong>{deletingExercise?.trackSlug}</strong>? This action cannot be undone.
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
