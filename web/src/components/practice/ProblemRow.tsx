"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/api";

const difficultyColor: Record<Problem["difficulty"], string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

const difficultyBg: Record<Problem["difficulty"], string> = {
  Easy: "bg-emerald-400/10 border-emerald-500/30",
  Medium: "bg-amber-400/10 border-amber-500/30",
  Hard: "bg-rose-400/10 border-rose-500/30",
};

interface ProblemRowProps {
  problem: Problem;
  isSelectPage: boolean;
  onSelect: () => void;
  isHosting: boolean;
}

export const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  isSelectPage,
  onSelect,
  isHosting,
}) => {
  return (
    <TableRow className="group border-t border-border/40 hover:bg-primary/3 transition-colors">
      <TableCell className="pl-4 pr-0 md:pr-4 py-3 align-middle text-xs text-muted-foreground">
        {problem.problem_id}
      </TableCell>
      <TableCell className="px-0 md:px-4 py-3 align-middle min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="text-sm truncate font-bold text-foreground group-hover:text-primary transition-colors">
            {isSelectPage ? (
                <Button className="p-0" variant="link" onClick={onSelect}>
                  {problem.title}
                </Button>
            ) : (
              <Link href={`/practice/problem/${problem.problem_slug}`}>
                {" "}
                <Button className="p-0" variant="link">
                  {problem.title}
                </Button>
              </Link>
            )}
          </div>
          <span className="mt-0.5 truncate text-[10px] uppercase font-bold tracking-tight text-muted-foreground/60 hidden sm:block">
            {problem.problem_slug}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
            difficultyBg[problem.difficulty],
            difficultyColor[problem.difficulty],
            "border-transparent",
          )}
        >
          {problem.difficulty}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-[11px] text-muted-foreground hidden md:table-cell">
        <div className="flex flex-wrap gap-1.5">
          {problem.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-right whitespace-nowrap">
        {isSelectPage ? (
          <Button
            key={problem.problem_id}
            size="sm"
            onClick={onSelect}
            disabled={isHosting}
          >
            {isHosting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>SELECT</>
            )}
          </Button>
        ) : (
          <Link href={`/practice/problem/${problem.problem_slug}`}>
            <Button key={problem.problem_id} size="sm">
              SOLVE
            </Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
};
