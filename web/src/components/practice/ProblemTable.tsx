"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ProblemRow } from "./ProblemRow";
import { ProblemRowSkeleton } from "@/components/shared/Skeletons";
import { EmptyDisplay } from "@/components/shared/StatusState";
import { QueryGuard } from "@/components/shared/QueryGuard";
import type { ProblemTableProps } from "@/types/component.types";

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
}) => {
  return (
    <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <QueryGuard
          loading={isLoading}
          error={error}
          data={problems}
          skeleton={
            <Table className="table-fixed">
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
                  <TableHead className="px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-20 sm:w-32">
                    Difficulty
                  </TableHead>
                  <TableHead className="px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-40 hidden md:table-cell">
                    Topics
                  </TableHead>
                  <TableHead className="px-4 py-3 h-12 text-right font-bold text-xs uppercase tracking-widest w-24 sm:w-28">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problemList.map((problem) => (
                  <ProblemRow
                    key={problem.problem_id}
                    problem={problem}
                    isSelectPage={isSelectPage}
                    onSelect={() => onSelect(problem)}
                    isHosting={
                      (isHosting || isUpdating) && selectingId === problem.problem_id
                    }
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </QueryGuard>
      </CardContent>
    </Card>
  );
};
