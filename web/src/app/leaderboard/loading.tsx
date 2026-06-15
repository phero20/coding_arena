import { LeaderboardHeader } from "@/components/stats/leaderboard/LeaderboardHeader";
import { LeaderboardRowSkeleton } from "@/components/skeletons/LeaderboardSkeleton";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <ScrollToTop />
      <div className="max-w-6xl mx-auto space-y-6">
        <LeaderboardHeader />
        
        {/* Full Table Skeleton Wrapper */}
        <div className="flex flex-col gap-4">
          <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
