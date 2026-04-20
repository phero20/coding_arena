"use client";

import React from "react";
import type { ProblemPaginationProps } from "@/types/component.types";
import { Button } from "@/components/ui/button";



export const ProblemPagination: React.FC<ProblemPaginationProps> = ({
  page,
  totalPages,
  setPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 pt-2">
      <p className="text-xs font-medium text-muted-foreground">
        Page <span className="text-foreground">{page}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 border-border/40 font-bold transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30"
          onClick={() => {
            setPage((p: number) => Math.max(1, p - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 border-border/40 font-bold transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30"
          onClick={() => {
            setPage((p: number) => Math.min(totalPages, p + 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
