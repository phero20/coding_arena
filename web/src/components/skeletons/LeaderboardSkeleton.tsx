import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import { TableRow, TableCell, TableBody } from "@/components/ui/table";

interface LeaderboardSkeletonProps {
  count?: number;
  fragment?: boolean;
}

export const LeaderboardRowSkeleton: React.FC<LeaderboardSkeletonProps> = ({ 
  count = 10,
  fragment = false 
}) => {
  const content = (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-b border-border/40 hover:bg-transparent">
          <TableCell className="pl-0 md:pl-4 pr-0 md:pr-4 py-3 w-12 text-center">
            <Skeleton width={24} height={14} className="mx-auto" />
          </TableCell>
          <TableCell className="pl-0 md:pl-6 py-3">
            <div className="flex items-center gap-3">
              <Skeleton circle width={36} height={36} className="flex-shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Skeleton width="85%" height={14} className="rounded-sm" />
                <Skeleton width="50%" height={10} className="rounded-sm opacity-50" />
              </div>
            </div>
          </TableCell>
          <TableCell className="px-4 md:px-6 py-3 text-center w-20 sm:w-32">
            <Skeleton width={60} height={14} className="mx-auto rounded-sm" />
          </TableCell>
          <TableCell className="px-4 md:px-6 py-3 text-right pr-4 md:pr-8 w-24 sm:w-28">
            <Skeleton width={50} height={20} className="ml-auto rounded-sm" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  if (fragment) {
    return (
      <SkeletonProvider noWrapper>
        {content}
      </SkeletonProvider>
    );
  }

  return (
    <SkeletonProvider noWrapper>
      <TableBody>
        {content}
      </TableBody>
    </SkeletonProvider>
  );
};
