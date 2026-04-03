import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Terminal } from "lucide-react";

/**
 * Full-screen Workspace Skeleton (IDE Style)
 * Used by Practice and Arena Match pages
 */
export const WorkspaceSkeleton = () => (
  <div className="h-screen w-full bg-background flex flex-col p-4 space-y-4">
    <div className="flex gap-4 h-12">
      <Skeleton className="h-full w-48 bg-muted/20" />
      <Skeleton className="h-full w-32 bg-muted/20" />
    </div>
    <div className="flex-1 flex gap-4">
      <Skeleton className="h-full flex-1 bg-muted/10" />
      <Skeleton className="h-full flex-[1.5] bg-muted/5" />
    </div>
  </div>
);

/**
 * Arena Lobby Skeleton
 * Used by the Room Lobby page
 */
export const LobbySkeleton = () => (
  <div className="h-screen w-full bg-background flex flex-col items-center justify-center p-4 space-y-8">
    <Skeleton className="h-16 w-56 bg-secondary/20" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Skeleton className="h-36 rounded-3xl bg-secondary/10" />
      <Skeleton className="h-36 rounded-3xl bg-secondary/10" />
    </div>
  </div>
);

/**
 * Generic Table/List Skeleton
 */
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4 w-full">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full bg-muted/10 rounded-xl" />
    ))}
  </div>
);

/**
 * Problem Table Row Skeleton
 * Specifically for the data table in practice/browse sections
 */
export const ProblemRowSkeleton = ({ count = 8 }: { count?: number }) => (
  <TableBody>
    {Array.from({ length: count }).map((_, i) => (
      <TableRow key={i} className="animate-pulse border-b border-border/40">
        <TableCell className="px-4 py-3">
          <Skeleton className="h-3 w-12 rounded-full bg-muted/20" />
        </TableCell>
        <TableCell className="px-4 py-3">
          <Skeleton className="h-3 w-40 rounded-full bg-muted/20" />
        </TableCell>
        <TableCell className="px-4 py-3">
          <Skeleton className="h-6 w-20 rounded-full bg-muted/20" />
        </TableCell>
        <TableCell className="px-4 py-3 hidden md:table-cell">
          <Skeleton className="h-3 w-32 rounded-full bg-muted/20" />
        </TableCell>
        <TableCell className="px-4 py-3">
          <Skeleton className="h-8 w-16 rounded-lg bg-muted/20 ml-auto" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

/**
 * Workspace Console Skeleton
 * For the TabsContent in ConsolePanel
 */
export const ConsoleSkeleton = () => (
  <div className="h-full flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-3 animate-pulse">
      <Terminal className="size-8 text-muted-foreground/40" />
      <Skeleton className="h-3 w-32 rounded-full bg-muted/20" />
    </div>
  </div>
);

/**
 * Submission History Item Skeleton
 */
export const SubmissionSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-16 w-full rounded-lg bg-muted/20 border border-border/50"
      />
    ))}
  </div>
);
