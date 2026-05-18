import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

/**
 * Problem Table Row Skeleton (Ghost of ProblemRow)
 */
export const ProblemRowSkeleton = ({ count = 8 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <TableBody>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-t border-border/40 h-16">
          <TableCell className="pl-4 pr-0 md:pr-4 py-4 w-12">
            <Skeleton width={20} height={12} />
          </TableCell>
          <TableCell className="px-0 md:px-4 py-4">
            <div className="flex flex-col gap-1 min-w-0">
              <Skeleton width="80%" height={16} />
              <Skeleton width="40%" height={10} />
            </div>
          </TableCell>
          <TableCell className="px-4 py-4 w-20 sm:w-32">
            <Skeleton width={60} height={24} className="rounded-md" />
          </TableCell>
          <TableCell className="px-4 py-4 w-40 hidden md:table-cell">
            <div className="flex gap-1.5">
              <Skeleton width={45} height={18} />
              <Skeleton width={45} height={18} />
            </div>
          </TableCell>
          <TableCell className="px-4 py-4 text-right w-24 sm:w-28 whitespace-nowrap">
            <Skeleton width={64} height={32} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </SkeletonProvider>
);

/**
 * Submission History Item Skeleton
 */
export const SubmissionSkeleton = ({ count = 3 }: { count?: number }) => (
  <SkeletonProvider>
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-border/40 rounded-lg flex justify-between items-center">
          <div className="space-y-2 flex-1">
             <Skeleton width="40%" height={14} />
             <Skeleton width="20%" height={10} />
          </div>
          <Skeleton width={60} height={24} />
        </div>
      ))}
    </div>
  </SkeletonProvider>
);

/**
 * Social List Item Skeleton (Ghost of SocialTab Rows)
 */
export const SocialListSkeleton = ({ count = 6 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-border/40 rounded-xl flex items-center justify-between bg-card/10">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton circle width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} />
            </div>
          </div>
          <Skeleton width={80} height={32} className="rounded-full" />
        </div>
      ))}
    </div>
  </SkeletonProvider>
);
