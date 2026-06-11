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
 * Roadmap Sidebar Skeleton
 * Mirrors the table layout in the roadmap detail sidebar
 */
export const RoadmapSidebarSkeleton = () => (
  <SkeletonProvider noWrapper>
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="px-4 md:px-8 pt-8 pb-6">
        <div className="flex flex-col gap-4 text-start">
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={24} className="rounded-full" />
          </div>
          <Skeleton width={240} height={40} className="rounded-md" />
          <Skeleton count={2} height={14} className="rounded-sm opacity-20" />
          <Skeleton width="60%" height={14} className="rounded-sm opacity-20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mt-2">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="pl-4 pr-0 md:pr-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-12">
                ID
              </TableHead>
              <TableHead className="px-4 md:px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest">
                Title
              </TableHead>
              <TableHead className="px-4 py-3 h-12 text-right md:text-left font-bold text-xs uppercase tracking-widest w-28 sm:w-32">
                Difficulty
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-t border-border/40 hover:bg-transparent">
                <TableCell className="pl-4 pr-0 md:pr-4 py-3 align-middle text-xs text-muted-foreground">
                  <Skeleton width={20} height={12} />
                </TableCell>
                <TableCell className="px-0 md:px-4 py-3 align-middle min-w-0">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <Skeleton width="85%" height={14} className="rounded-sm" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-right md:text-left">
                  <Skeleton width={65} height={20} className="rounded-md inline-block" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </SkeletonProvider>
);
