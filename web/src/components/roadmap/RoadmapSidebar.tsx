"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategoryDetailByIdQuery } from "@/hooks/queries/use-taxonomy.queries";
import { useRoadmapData } from "@/hooks/practice/use-roadmap-data";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, CheckCircle2, GripVertical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RoadmapSidebarSkeleton } from "@/components/skeletons/RoadmapSkeletons";
import { Problem } from "@/types/api";

interface RoadmapSidebarProps {
  nodeId: string | null;
  onClose: () => void;
}

export const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({
  nodeId,
  onClose,
}) => {
  const { data: detail, isLoading, error } = useCategoryDetailByIdQuery(nodeId);
  const { solvedIds } = useRoadmapData();

  const [width, setWidth] = useState(800);
  const [isMobile, setIsMobile] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || isMobile) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 700 && newWidth < window.innerWidth * 0.95) {
      setWidth(newWidth);
    }
  }, [isMobile]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, [handleMouseMove]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, stopResizing, isMobile]);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  const difficultyBg: Record<Problem["difficulty"], string> = {
    Easy: "bg-difficulty-easy border-difficulty-easy",
    Medium: "bg-difficulty-medium border-difficulty-medium",
    Hard: "bg-difficulty-hard border-difficulty-hard",
  };

  const difficultyColor: Record<Problem["difficulty"], string> = {
    Easy: "text-difficulty-easy",
    Medium: "text-difficulty-medium",
    Hard: "text-difficulty-hard",
  };
  return (
    <Sheet open={!!nodeId} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {nodeId && (
          <SheetContent
            side="right"
            forceMount
            className="p-0 border-none bg-transparent shadow-none sm:max-w-none transition-none overflow-visible"
            style={{ width: isMobile ? "100%" : `${width}px` }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex flex-col h-full bg-background border-l-2 border-primary/10 relative"
            >
              {/* Tactical Resize Handle - Styled to match Shadcn Resizable */}
              <div
                onMouseDown={startResizing}
                className="absolute -left-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/20 transition-all group z-50 hidden sm:flex items-center justify-center"
              >
                <div className="z-10 flex h-7 w-4 items-center justify-center rounded-md border bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
              <QueryGuard
                loading={isLoading}
                error={error}
                data={detail}
                skeleton={<RoadmapSidebarSkeleton />}
              >
                {(cat) => (
                  <>
                    <SheetHeader className="px-4 md:px-8 pt-8 pb-6 ">
                      <div className="flex flex-col gap-4 text-start">
                        <div className="flex items-center justify-between">
                          <Badge>
                            Parent: {cat.parent?.name || "Main Topic"}
                          </Badge>
                        </div>
                        <SheetTitle className="text-4xl font-black tracking-tighter text-foreground">
                          {cat.name}
                        </SheetTitle>
                        {cat.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl text-start">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </SheetHeader>

                    <div
                      className={cn(
                        "flex-1 overflow-y-auto mt-2",
                        cat.problems.length === 0 ? "px-4" : "",
                      )}
                    >
                      <QueryGuard
                        data={cat.problems}
                        loading={false} // Already handled by parent
                        error={null} // Already handled by parent
                        emptyTitle="No Problems Found"
                        emptyMessage="This node doesn't have any problems mapped to it yet."
                        emptyIcon={Code2}
                      >
                        <Table>
                          <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent border-none">
                              <TableHead className="w-[30px] pl-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                ID
                              </TableHead>
                              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                Title
                              </TableHead>
                              <TableHead className="w-[120px] font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                Difficulty
                              </TableHead>
                              <TableHead className="w-[100px] text-right pr-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                                Action
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cat.problems.map((prob) => {
                              const isSolved = solvedIds.has(prob.problem_id);
                              return (
                                <TableRow
                                  key={prob.problem_id}
                                  className={cn(
                                    "group border-b border-border transition-colors",
                                    isSolved
                                      ? "bg-primary/20 hover:bg-primary/15"
                                      : "hover:bg-primary/5",
                                  )}
                                >
                                  <TableCell className="pl-4 pr-0 md:pr-4 py-3 align-middle text-xs text-muted-foreground">
                                    {prob.problem_id.padStart(2, "0")}
                                  </TableCell>
                                  <TableCell className="px-0 md:px-4 py-3 align-middle min-w-0">
                                    <div className="flex flex-col min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm truncate font-bold text-foreground group-hover:text-primary transition-colors">
                                          <Link
                                            href={`/problems/${prob.problem_slug}?from=roadmap`}
                                          >
                                            <Button
                                              className="p-0 h-auto "
                                              variant="link"
                                            >
                                              {prob.title}
                                            </Button>
                                          </Link>
                                        </div>
                                      </div>
                                      {/* <span className="mt-0.5 truncate text-[10px] uppercase font-bold tracking-tight text-muted-foreground/60">
                                  {prob.problem_slug}
                                </span> */}
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 align-middle">
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                                        difficultyBg[prob.difficulty],
                                        difficultyColor[prob.difficulty],
                                        "border-transparent",
                                      )}
                                    >
                                      {prob.difficulty}
                                    </span>
                                  </TableCell>
                                  <TableCell className="pr-6 py-4 text-right">
                                    <Link
                                      href={`/problems/${prob.problem_slug}?from=roadmap`}
                                    >
                                      <Button
                                        size="sm"
                                        variant={
                                          isSolved ? "secondary" : "default"
                                        }
                                      >
                                        {isSolved ? (
                                          <div className="flex items-center gap-2 text-difficulty-easy">
                                            <CheckCircle2 className="size-4 shrink-0" />
                                            <span className="hidden sm:block">
                                              Solved
                                            </span>
                                          </div>
                                        ) : (
                                          "Solve"
                                        )}
                                      </Button>
                                    </Link>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </QueryGuard>
                    </div>
                  </>
                )}
              </QueryGuard>
            </motion.div>
          </SheetContent>
        )}
      </AnimatePresence>
    </Sheet>
  );
};
