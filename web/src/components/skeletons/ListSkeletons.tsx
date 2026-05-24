import React from "react";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import { 
  Table,
  TableHeader,
  TableBody, 
  TableCell, 
  TableHead,
  TableRow 
} from "@/components/ui/table";

/**
 * Problem Table Row Skeleton (Ghost of ProblemRow)
 */
export const ProblemRowSkeleton = ({ count = 8, fragment = false }: { count?: number; fragment?: boolean }) => {
  const content = (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-t border-border/40 hover:bg-transparent">
          {/* ID Column */}
          <TableCell className="pl-4 pr-0 md:pr-4 py-3 w-12">
            <Skeleton width={20} height={12} />
          </TableCell>
          
          {/* Title & Slug Column */}
          <TableCell className="px-0 md:px-4 py-3 min-w-0">
            <div className="flex flex-col gap-1.5 min-w-0">
              <Skeleton width="85%" height={14} className="rounded-sm" />
              <div className="hidden sm:block">
                <Skeleton width="40%" height={10} className="rounded-sm opacity-50" />
              </div>
            </div>
          </TableCell>
          
          {/* Difficulty Column */}
          <TableCell className="px-4 py-3 w-24">
            <Skeleton width={65} height={20} className="rounded-md" />
          </TableCell>
          
          {/* Topics Column */}
          <TableCell className="px-4 py-3 w-40 hidden md:table-cell">
            <div className="flex gap-1.5">
              <Skeleton width={42} height={16} className="rounded-sm" />
              <Skeleton width={42} height={16} className="rounded-sm" />
            </div>
          </TableCell>
          
          {/* Action Column */}
          <TableCell className="px-4 py-3 text-right w-24 whitespace-nowrap">
            <Skeleton width={56} height={32} className="rounded-md" />
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

/**
 * Submission History Item Skeleton (Ghost of SubmissionHistory items)
 */
/**
 * Submission History Item Skeleton (Ghost of SubmissionHistory items)
 */
export const SubmissionSkeleton = ({ count = 10 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="overflow-hidden border border-border/40 rounded-xl bg-card/10">
      <Table className="table-fixed border-separate border-spacing-0 w-full">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/10">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-[160px] text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground">
              Language
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
                <Skeleton width={80} height={18} className="rounded-md" />
              </TableCell>
              <TableCell className="py-4 pl-0 border-b border-border/40">
                <Skeleton width={60} height={16} className="rounded-md" />
              </TableCell>
              <TableCell className="py-4 text-right pr-6 border-b border-border/40">
                <div className="flex flex-col items-end gap-1">
                  <Skeleton width={70} height={10} className="rounded-sm opacity-40" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
        <div key={i} className="p-3 border border-border/40 rounded-xl flex items-center justify-between bg-card/10">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar */}
            <Skeleton circle width={40} height={40} />
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Name */}
              <Skeleton width="70%" height={14} className="rounded-sm" />
              {/* Username */}
              <Skeleton width="45%" height={10} className="rounded-sm opacity-50" />
            </div>
          </div>
          {/* Action Button */}
          <div className="ml-4">
            <Skeleton width={85} height={32} className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonProvider>
);

