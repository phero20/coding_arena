import { useUserStatsAdmin } from "@/hooks/useUserAdmin";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueryState } from "@/components/ui/query-state";
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

interface UserStatsViewerProps {
  id: string; // userId
  onEdit: () => void;
}

export function UserStatsViewer({ id, onEdit }: UserStatsViewerProps) {
  const { stats, isLoading, isError, error, deleteStats, isDeleting } = useUserStatsAdmin(id);
  const [showDelete, setShowDelete] = useState(false);

  if (!stats || !stats.userId) {
    return null; // Handled by parent
  }

  const handleDelete = async () => {
    await deleteStats(stats.userId);
    setShowDelete(false);
  };

  return (
    <QueryState isLoading={isLoading} isError={isError} error={error} loadingMessage="Loading user stats...">
      <div className="flex flex-col h-full min-h-0 space-y-6 p-2">
      <div className="flex items-center justify-between pb-6 border-b">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            User Stats Overview
          </h3>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {stats.userId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowDelete(true)} size="lg" variant="outline"  className="gap-2 text-destructive px-4">
            <Trash2 className="" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 space-y-6 pb-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">Including {stats.arenaPoints} arena points</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSolved}</div>
              <p className="text-xs text-muted-foreground mt-1">Problems completed</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                {stats.currentStreak} <span className="text-sm font-normal text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Best streak: {stats.bestStreak}</p>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Arena Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.arenaGames}</div>
              <p className="text-xs text-muted-foreground mt-1">Matches played</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Difficulty Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-muted/10">
                  <span className="text-sm font-medium text-muted-foreground mb-1">Easy</span>
                  <span className="text-2xl font-bold">{stats.easySolved}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-muted/10">
                  <span className="text-sm font-medium text-muted-foreground mb-1">Medium</span>
                  <span className="text-2xl font-bold">{stats.mediumSolved}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-muted/10">
                  <span className="text-sm font-medium text-muted-foreground mb-1">Hard</span>
                  <span className="text-2xl font-bold">{stats.hardSolved}</span>
                </div>
              </div>
              
              <div className="pt-5 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Last Solve Date
                </span>
                <span className="font-medium">{stats.lastSolveDate ? new Date(stats.lastSolveDate).toLocaleDateString() : "Never"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Language Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                Language Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats.languageCounts || Object.keys(stats.languageCounts).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border border-dashed">
                  <p className="text-muted-foreground text-sm">No language data recorded yet.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.languageCounts).map(([lang, count]) => (
                    <Badge key={lang} variant="secondary" className="px-3 py-1.5 text-sm flex gap-2 items-center hover:bg-secondary/80 transition-colors">
                      <span className="capitalize">{lang}</span>
                      <span className="bg-background px-1.5 py-0.5 rounded-md text-xs font-bold text-foreground shadow-sm">
                        {count as React.ReactNode}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Stats?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to completely delete the stats for this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Stats"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </QueryState>

  );
}
