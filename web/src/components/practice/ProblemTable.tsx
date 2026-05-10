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
}) => {
  const renderBody = () => {
    if (isLoading) {
      return <ProblemRowSkeleton />;
    }

    if (error) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-10 text-center text-sm text-destructive"
            >
              Failed to load problems: {error.message}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (!problems.length) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5}>
              <EmptyDisplay
                title="No Problems Found"
                message={
                  topicFilter
                    ? `No challenges match the topic "${topicFilter}".`
                    : "Try adjusting your filters or search terms."
                }
              />
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {problems.map((problem) => (
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
    );
  };

  return (
    <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
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
          {renderBody()}
        </Table>
      </CardContent>
    </Card>
  );
};
