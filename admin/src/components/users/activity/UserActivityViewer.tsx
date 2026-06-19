import { useUserActivityAdmin } from "@/hooks/useUserAdmin";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Calendar, Trophy, Crosshair, Swords, Code2, Search } from "lucide-react";
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

interface UserActivityViewerProps {
  userId: string;
  onEdit: (date: string) => void;
  onCreate: () => void;
}

export function UserActivityViewer({ userId, onEdit, onCreate }: UserActivityViewerProps) {
  const { activity, isLoading, isError, error, deleteActivity, isDeleting } = useUserActivityAdmin(userId);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!activity) {
    return null;
  }

  const filteredActivity = activity.filter((item) =>
    item.date.includes(searchQuery)
  );

  const handleDelete = async () => {
    if (deletingDate) {
      await deleteActivity({ id: userId, date: deletingDate });
      setDeletingDate(null);
    }
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading activity...">
      <div className="flex flex-col h-full min-h-0 space-y-6 p-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              User Activity
            </h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {userId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Action buttons can go here if needed, Create is now handled in left tabs */}
          </div>
        </div>

        <div className="relative max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by date (YYYY-MM-DD)..."
            className="pl-8 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto min-h-0 space-y-4 pb-6">
          {filteredActivity.length === 0 ? (
            <EmptyState message={searchQuery ? "No activity matches this date." : "No activity recorded for this user yet."} />
          ) : (
            <div className="rounded-md border flex-1 min-h-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Arena Points</TableHead>
                    <TableHead className="text-right">Submissions</TableHead>
                    <TableHead className="text-right">Matches</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((item) => (
                    <TableRow key={item.date}>
                      <TableCell className="font-medium">{item.date}</TableCell>
                      <TableCell className="text-right">{item.pointsEarned}</TableCell>
                      <TableCell className="text-right">{item.arenaPointsEarned}</TableCell>
                      <TableCell className="text-right">{item.submissions}</TableCell>
                      <TableCell className="text-right">{item.matches}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button onClick={() => onEdit(item.date)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => setDeletingDate(item.date)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
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

      <AlertDialog open={!!deletingDate} onOpenChange={(open) => !open && setDeletingDate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the activity record for <strong>{deletingDate}</strong>? This action cannot be undone.
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
