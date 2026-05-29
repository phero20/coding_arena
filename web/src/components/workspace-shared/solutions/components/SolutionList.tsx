"use client";

import React from "react";
import { Solution } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ChevronRight, Edit, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { SolutionsSkeleton } from "@/components/skeletons/WorkspaceSkeletons";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface SolutionListProps {
  type: "community" | "my-solutions";
  solutions: Solution[];
  isLoading?: boolean;
  error?: any;
  onSelect: (id: string) => void;
  onRetry?: () => void;
  onCreateNew?: () => void;
}

export const SolutionList: React.FC<SolutionListProps> = ({
  type,
  solutions,
  isLoading = false,
  error,
  onSelect,
  onRetry,
  onCreateNew,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="animate-in fade-in duration-300 h-full">
        <QueryGuard
          loading={isLoading}
          error={error}
          data={solutions}
          skeleton={<SolutionsSkeleton />}
          onRetry={onRetry}
          emptyIcon={type === "my-solutions" ? Edit : undefined}
          emptyTitle={
            type === "my-solutions"
              ? "No solutions yet"
              : "No community solutions"
          }
          emptyMessage={
            type === "my-solutions"
              ? "Share your approach and help others learn. Your solutions will appear here."
              : "Be the first to share your approach for this problem!"
          }
          emptyAction={
            type === "my-solutions" ? (
              <Button onClick={onCreateNew} className="h-10">
                <Edit className="size-4" />
                Write your first solution
              </Button>
            ) : undefined
          }
        >
          {(solutionsList) => (
            <div className="w-full">
              <Table className="table-fixed">
                <TableHeader className="bg-muted/10 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">
                      Solution
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[80px] sm:w-[120px]">
                      Stats
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solutionsList.map((solution, index) => {
                    const isOfficial = solution.id.startsWith("official");

                    return (
                      <TableRow
                        key={solution.id}
                        className="group transition-colors border-border/40 cursor-pointer hover:bg-muted/30"
                        onClick={() => onSelect(solution.id)}
                      >
                        <TableCell className="py-4 pl-6 min-w-0">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <Link
                              href={`/u/${solution.author.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0"
                            >
                              <Avatar className="size-8 sm:size-9 border border-border/40 shadow-sm group-hover:border-primary/40 transition-colors">
                                <AvatarImage
                                  src={solution.author.avatarUrl || ""}
                                />
                                <AvatarFallback className="text-[10px] font-bold bg-muted">
                                  {solution.author.username
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className="text-xs sm:text-sm font-bold text-foreground/90 truncate group-hover:text-primary transition-colors uppercase">
                                  {solution.title}
                                </h3>
                                {isOfficial && (
                                  <ShieldCheck className="size-3.5 text-primary shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 min-w-0">
                                by
                                <span className="">
                                  {solution.author.username}
                                </span>
                                <span className="shrink-0">•</span>
                                <span className="truncate">
                                  {formatDistanceToNow(
                                    new Date(solution.createdAt),
                                  )}{" "}
                                  ago
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-6 text-muted-foreground/60">
                            {!isOfficial && (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 text-primary">
                                  <ThumbsUp className="size-3.5" />
                                  <span className="text-xs font-black tabular-nums">
                                    {solution.upvotes}
                                  </span>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                                  Votes
                                </span>
                              </div>
                            )}
                            <ChevronRight className="size-4 group-hover:text-primary transition-colors" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </QueryGuard>
      </div>
    </div>
  );
};