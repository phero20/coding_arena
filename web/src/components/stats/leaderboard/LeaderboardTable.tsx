import React from "react";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { LeaderboardEntry, LeaderboardResponse } from "@/types/stats";
import { LeaderboardRow } from "./LeaderboardRow";
import { LeaderboardRowSkeleton } from "@/components/skeletons/LeaderboardSkeleton";
import { SkeletonProvider } from "@/components/skeletons/BaseSkeleton";
import { QueryGuard } from "@/components/shared/QueryGuard";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error?: any;
  onRetry?: () => void;
  viewerRank?: LeaderboardResponse["viewerRank"];
}

export function LeaderboardTable({ 
  entries, 
  isLoading, 
  error,
  onRetry,
  viewerRank 
}: LeaderboardTableProps) {
  const isUserInList = entries.some(e => e.userId === viewerRank?.userId);

  return (
    <div className="flex flex-col gap-4">
      <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <QueryGuard
            loading={isLoading}
            error={error}
            data={entries}
            skeleton={
              <Table className="table-fixed">
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="pl-0 md:pl-4 pr-0 md:pr-4 py-3 h-12 text-center font-bold text-xs uppercase tracking-widest w-12">
                      Rank
                    </TableHead>
                    <TableHead className="pl-2 md:pl-8 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest">
                      User
                    </TableHead>
                    <TableHead className="px-4 md:px-6 py-3 h-12 text-center font-bold text-xs uppercase tracking-widest w-20 sm:w-32">
                      Solved
                    </TableHead>
                    <TableHead className="px-4 md:px-6 py-3 h-12 text-right font-bold text-xs uppercase tracking-widest w-20 sm:w-24 pr-4 md:pr-8">
                      Points
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <LeaderboardRowSkeleton />
              </Table>
            }
            emptyTitle="No Data Found"
            emptyMessage="No users were found matching your current rankings filter."
            onRetry={onRetry}
          >
            {(list) => (
              <Table className="table-fixed">
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="pl-0 md:pl-4 pr-0 md:pr-4 py-3 h-12 text-center font-bold text-xs uppercase tracking-widest w-12">
                      Rank
                    </TableHead>
                    <TableHead className="pl-2 md:pl-8 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest">
                      User
                    </TableHead>
                    <TableHead className="px-4 md:px-6 py-3 h-12 text-center font-bold text-xs uppercase tracking-widest w-20 sm:w-32">
                      Solved
                    </TableHead>
                    <TableHead className="px-4 md:px-6 py-3 h-12 text-right font-bold text-xs uppercase tracking-widest w-20 sm:w-24 pr-4 md:pr-8">
                      Points
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((entry) => (
                    <LeaderboardRow
                      key={entry.userId}
                      entry={entry}
                      isViewer={entry.userId === viewerRank?.userId}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </QueryGuard>
        </CardContent>
      </Card>

      {/* Professional Viewer Context Footer */}
      {viewerRank && !isUserInList && (
        <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <Table className="table-fixed">
              <TableBody>
                <LeaderboardRow entry={viewerRank} isViewer />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
