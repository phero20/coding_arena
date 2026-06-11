"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ProblemRow } from "./ProblemRow";
import { ProblemRowSkeleton } from "@/components/shared/Skeletons";
import { QueryGuard } from "@/components/shared/QueryGuard";
import type { ProblemTableProps } from "@/types/component.types";
import { useAuth } from "@clerk/nextjs";
import { useUserSolvedProblemsQuery } from "@/hooks/queries/use-problem.queries";


export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  isLoading,
  error,
  isSelectPage,
  onSelect,
  selectingId,
  isHosting,
  isUpdating,
  topicFilter,
  onRetry,
  isFetchingNextPage,
  hasNextPage,
}) => {
  const { userId } = useAuth();
  const { data: solvedProblems } = useUserSolvedProblemsQuery(userId as string, !!userId);
  const solvedIds = useMemo(() => new Set(solvedProblems || []), [solvedProblems]);


  return (
    <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <QueryGuard
          loading={isLoading}
          error={error}
          data={problems}
          skeleton={
            <Table className="table-fixed">
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="pl-4 pr-0 md:pr-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-12">
                    ID
                  </TableHead>
                  <TableHead className="px-4 md:px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest">
                    Title
                  </TableHead>
                  <TableHead className="px-4 py-3 h-12 text-right md:text-left font-bold text-xs uppercase tracking-widest w-28 sm:w-32">
                    Difficulty
                  </TableHead>
                  <TableHead className="px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-40 hidden md:table-cell">
                    Topics
                  </TableHead>
                </TableRow>
              </TableHeader>
              <ProblemRowSkeleton />
            </Table>
          }
          emptyTitle="No Problems Found"
          emptyMessage={
            topicFilter
              ? `No problems match the topic "${topicFilter}".`
              : "Try adjusting your filters or search terms."
          }
          onRetry={onRetry}
        >
          {(problemList) => (
            <Table className="table-fixed">
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="pl-4 pr-0 md:pr-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-12">
                    ID
                  </TableHead>
                  <TableHead className="px-4 md:px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest">
                    Title
                  </TableHead>
                  <TableHead className="px-4 py-3 h-12 text-right md:text-left font-bold text-xs uppercase tracking-widest w-28 sm:w-32">
                    Difficulty
                  </TableHead>
                  <TableHead className="px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-40 hidden md:table-cell">
                    Topics
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problemList.map((problem) => (
                  <ProblemRow
                    key={problem.problem_id}
                    problem={problem}
                    isSelectPage={!!isSelectPage}
                    onSelect={() => onSelect?.(problem)}
                    isHosting={
                      !!((isHosting || isUpdating) && selectingId === problem.problem_id)
                    }
                    isSolved={solvedIds.has(problem.problem_id) || solvedIds.has(problem.problem_slug)}
                  />
                ))}
                {isFetchingNextPage && (
                  <ProblemRowSkeleton count={10} fragment />
                )}
              </TableBody>
            </Table>
          )}
        </QueryGuard>
      </CardContent>
    </Card>
  );
};
