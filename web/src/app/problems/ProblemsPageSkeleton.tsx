import { Container } from "@/components/shared/Container";
import { SkeletonProvider } from "@/components/skeletons/BaseSkeleton";
import { ProblemRowSkeleton } from "@/components/skeletons/ListSkeletons";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import Skeleton from "react-loading-skeleton";

export default function ProblemsPageSkeleton() {
  return (
    <Container className="space-y-8">
      <SkeletonProvider noWrapper>
        <section className="space-y-6">
          {/* Header & Filters Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Problems</h1>
              <p className="text-sm text-muted-foreground mt-1 text-balance">
                Solve curated problems to sharpen your skills.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Skeleton height={32} width={240} className="rounded-lg opacity-60" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6 w-full">
            <div className="flex-1 w-full">
              <Skeleton height={40} className="rounded-md opacity-40 w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton height={40} width={160} className="rounded-md opacity-40" />
              <Skeleton height={40} width={72} className="rounded-md opacity-40" />
            </div>
          </div>

          {/* Table Skeleton */}
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
        </section>
      </SkeletonProvider>
    </Container>
  );
}
