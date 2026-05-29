import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Solutions List Skeleton (Ghost of SolutionsTab/SolutionList)
 */
export const SolutionsSkeleton = ({ count = 5 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="overflow-hidden border border-border/40 rounded-xl bg-card/10">
      <Table className="table-fixed border-separate border-spacing-0 w-full">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/10">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-[100px] text-muted-foreground">
              Votes
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
              Solution
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[120px] text-muted-foreground">
              Submitted
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: count }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell className="py-4 pl-6 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <Skeleton circle width={12} height={12} className="opacity-20" />
                  <Skeleton width={20} height={14} className="rounded-sm opacity-50" />
                </div>
              </TableCell>
              <TableCell className="py-4 pl-0 border-b border-border/40">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Skeleton width="65%" height={14} className="rounded-sm" />
                  <Skeleton width="40%" height={10} className="rounded-sm opacity-30" />
                </div>
              </TableCell>
              <TableCell className="py-4 text-right pr-6 border-b border-border/40">
                <Skeleton width={70} height={10} className="rounded-sm opacity-40" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </SkeletonProvider>
);
