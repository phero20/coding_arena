import { ScrollToTop } from "@/components/shared/ScrollToTop";
import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "@/components/skeletons/BaseSkeleton";
import { ProblemRowSkeleton } from "@/components/skeletons/ListSkeletons";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 w-full">
      <ScrollToTop />
      
      <SkeletonProvider noWrapper>
        {/* Header Skeleton */}
        <Button size="sm" disabled className="opacity-50 w-32"><ArrowLeft /> Companies</Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-6 border-b border-border/40">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center">
            <Skeleton width={80} height={80} className="rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton width={300} height={36} className="rounded-md" />
            <Skeleton width={450} height={20} className="rounded-sm opacity-60" />
          </div>
        </div>

        {/* Problem Table Skeleton */}
        <div className="w-full">
          <div className="overflow-hidden border border-border/40 rounded-xl bg-card/10">
            <Table className="table-fixed border-separate border-spacing-0 w-full">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-b border-border/10">
                  <TableHead className="w-16 md:w-24 pl-4 pr-0 md:pr-4">
                    <Skeleton width={30} height={12} className="opacity-50" />
                  </TableHead>
                  <TableHead className="px-0 md:px-4">
                    <Skeleton width={60} height={12} className="opacity-50" />
                  </TableHead>
                  <TableHead className="w-24 md:w-32 px-4 text-right md:text-left">
                    <Skeleton width={50} height={12} className="opacity-50 inline-block" />
                  </TableHead>
                  <TableHead className="w-48 px-4 hidden md:table-cell">
                    <Skeleton width={40} height={12} className="opacity-50" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ProblemRowSkeleton count={10} fragment />
              </TableBody>
            </Table>
          </div>
        </div>
      </SkeletonProvider>
    </div>
  );
}
