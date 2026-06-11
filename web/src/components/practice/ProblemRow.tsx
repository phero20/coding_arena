"use client";

import Link from "next/link";
import { Loader2, CheckCircle2, Lock, ExternalLink } from "lucide-react";
import type { ProblemRowProps } from "@/types/component.types";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const difficultyColor: Record<Problem["difficulty"], string> = {
  Easy: "text-difficulty-easy",
  Medium: "text-difficulty-medium",
  Hard: "text-difficulty-hard",
};

const difficultyBg: Record<Problem["difficulty"], string> = {
  Easy: "bg-difficulty-easy border-difficulty-easy",
  Medium: "bg-difficulty-medium border-difficulty-medium",
  Hard: "bg-difficulty-hard border-difficulty-hard",
};

export const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  isSelectPage,
  onSelect,
  isHosting,
  isSolved,
}) => {
  if (isSelectPage && problem.is_premium) return null;

  return (
    <TableRow className="group border-t border-border/40 transition-colors hover:bg-muted/30">
      <TableCell className="pl-4 pr-0 md:pr-4 py-3 align-middle text-xs text-muted-foreground">
        {problem.problem_id || "-:-"}
      </TableCell>
      <TableCell className="px-0 md:px-4 py-3 align-middle min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors min-w-0">
            {isSelectPage ? (
              <Button
                className={cn(
                  "p-0 text-foreground/90 group-hover:text-primary flex items-center max-w-full justify-start min-w-0",
                  isSolved && "text-difficulty-easy",
                )}
                variant="link"
                onClick={onSelect}
                disabled={isHosting}
              >
                <span className="truncate">{problem.title}</span>
                {isHosting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                )}
              </Button>
            ) : (
              <Link
                href={
                  problem.is_premium
                    ? `https://leetcode.com/problems/${problem.problem_slug}`
                    : `/problems/${problem.problem_slug}`
                }
                target={problem.is_premium ? "_blank" : undefined}
                rel={problem.is_premium ? "noopener noreferrer" : undefined}
                className="flex min-w-0 max-w-full"
              >
                {" "}
                <Button
                  className={cn(
                    "p-0 text-foreground/90 group-hover:text-primary flex items-center max-w-full justify-start min-w-0",
                    isSolved && "text-difficulty-easy",
                  )}
                  variant="link"
                >
                  <span className="truncate">{problem.title}</span>
                  {problem.is_premium && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="flex items-center ml-2 gap-1 text-difficulty-medium shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            <ExternalLink className="h-3 w-3 opacity-70 hidden lg:block" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-left">
                          <p>
                            We don't have this problem. Please click to visit
                            LeetCode
                            <br /> and solve. It's a premium LeetCode problem.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Button>
              </Link>
            )}
            {isSolved && (
              <CheckCircle2 className="h-4 w-4 text-difficulty-easy shrink-0" />
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-right md:text-left">
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
          {problem.topics.slice(0, 2).map((topic) => (
            <span
              key={topic}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
};
