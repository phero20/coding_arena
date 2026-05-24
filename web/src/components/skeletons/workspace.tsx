import Skeleton from "react-loading-skeleton";
import { SkeletonProvider } from "./BaseSkeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

/**
 * Workspace Table List Skeleton (Ghost of Workspace list view)
 */
export const WorkspaceListSkeleton = ({ count = 5 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="overflow-hidden border border-border/40 rounded-xl bg-card/10">
      <Table className="table-fixed border-separate border-spacing-0 w-full">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/10">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-[350px] text-muted-foreground">
              Workspace Folder
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground hidden md:table-cell">
              Type
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground hidden sm:table-cell w-[180px]">
              Last Active
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[120px] text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: count }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {/* Folder Icon + Name */}
              <TableCell className="py-4 pl-6 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <Skeleton
                    width={32}
                    height={32}
                    className="rounded-lg opacity-80"
                  />
                  <div className="space-y-1 flex-1">
                    <Skeleton width="60%" height={14} className="rounded-sm" />
                  </div>
                </div>
              </TableCell>
              {/* Type Column */}
              <TableCell className="py-4 pl-0 border-b border-border/40 hidden md:table-cell">
                <Skeleton
                  width={110}
                  height={16}
                  className="rounded-md opacity-50"
                />
              </TableCell>
              {/* Last Active Column */}
              <TableCell className="py-4 pl-0 border-b border-border/40 hidden sm:table-cell">
                <Skeleton
                  width={120}
                  height={12}
                  className="rounded-sm opacity-40"
                />
              </TableCell>
              {/* Actions Column */}
              <TableCell className="py-4 text-right pr-6 border-b border-border/40">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton width={24} height={24} className="rounded-full" />
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
 * Diagram Table List Skeleton
 */
export const DiagramListSkeleton = ({ count = 5 }: { count?: number }) => (
  <SkeletonProvider noWrapper>
    <div className="overflow-hidden border border-border/40 rounded-xl bg-card/10">
      <Table className="table-fixed border-separate border-spacing-0 w-full">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/10">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6 w-auto text-muted-foreground">
              Diagram Title
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-0 text-muted-foreground hidden sm:table-cell w-[180px]">
              Last Active
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6 w-[120px] text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: count }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              {/* Diagram Icon + Title */}
              <TableCell className="py-4 pl-6 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <Skeleton
                    width={20}
                    height={20}
                    className="rounded opacity-60"
                  />
                  <div className="space-y-1 flex-1">
                    <Skeleton width="50%" height={14} className="rounded-sm" />
                  </div>
                </div>
              </TableCell>
              {/* Last Active Column */}
              <TableCell className="py-4 pl-0 border-b border-border/40 hidden sm:table-cell">
                <Skeleton
                  width={120}
                  height={12}
                  className="rounded-sm opacity-40"
                />
              </TableCell>
              {/* Actions Column */}
              <TableCell className="py-4 text-right pr-6 border-b border-border/40">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton width={24} height={24} className="rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </SkeletonProvider>
);

