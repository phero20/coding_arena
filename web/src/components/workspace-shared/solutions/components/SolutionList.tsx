"use client";

import React from "react";
import { Solution } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ChevronRight, PenLine, Edit, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { SolutionsSkeleton } from "@/components/skeletons/WorkspaceSkeletons";
import Link from "next/link";

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
  // Common Render for Solution Card
  const renderSolutionCard = (solution: Solution) => (
    <Card
      key={solution.id}
      className="group cursor-pointer transition-all"
      onClick={() => onSelect(solution.id)}
    >
      <div className="p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link href={`/u/${solution.author.username}`}>
            <Avatar className="size-10 border border-border/40 group-hover:border-primary/40 transition-colors">
              <AvatarImage src={solution.author.avatarUrl || ""} />
              <AvatarFallback className="text-[10px]">
                {solution.author.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-foreground/90 truncate group-hover:text-primary transition-colors uppercase block max-w-full">
              {solution.title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {type === "community" ? (
                !solution.id.startsWith("official") && (
                  <>
                    <span>
                      by{" "}
                      <Link
                        href={`/u/${solution.author.username}`}
                        className="font-bold hover:text-primary transition-colors"
                      >
                        {solution.author.username}
                      </Link>
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(solution.createdAt))} ago
                    </span>
                  </>
                )
              ) : (
                <span>
                  Published {formatDistanceToNow(new Date(solution.createdAt))}{" "}
                  ago
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground/60 shrink-0">
          {!solution.id.startsWith("official") && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="size-3.5" />
              <span className="text-xs font-medium">{solution.upvotes}</span>
            </div>
          )}
          <ChevronRight className="size-4 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-5 animate-in fade-in duration-300">
        <QueryGuard
          loading={isLoading}
          error={error}
          data={solutions}
          skeleton={<SolutionsSkeleton />}
          onRetry={onRetry}
          emptyIcon={type === "my-solutions" ? Edit : undefined}
          emptyTitle={type === "my-solutions" ? "No solutions yet" : "No community solutions"}
          emptyMessage={
            type === "my-solutions"
              ? "Share your approach and help others learn. Your solutions will appear here."
              : "Be the first to share your approach for this problem!"
          }
          emptyAction={
            type === "my-solutions" ? (
              <Button
                onClick={onCreateNew}
                className="h-10"
              >
                <Edit className="size-4" />
                Write your first solution
              </Button>
            ) : undefined
          }
        >
          {(solutionsList) => (
            <div className="grid grid-cols-1 gap-4">
              {solutionsList.map(renderSolutionCard)}
            </div>
          )}
        </QueryGuard>
      </div>
    </div>
  );
};