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
import {
  Code2,
  CheckCircle2,
  GripVertical,
  Lock,
  ExternalLink,
  Bug,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RoadmapSidebarSkeleton } from "@/components/skeletons/RoadmapSkeletons";
import { Problem } from "@/types/api";
import type { CategoryTreeNode } from "@/types/taxonomy";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoadmapSidebarProps {
  nodeId: string | null;
  selectedNode: CategoryTreeNode | null;
  onClose: () => void;
}

export const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({
  nodeId,
  selectedNode,
  onClose,
}) => {
  const { data: detail, isLoading, error } = useCategoryDetailByIdQuery(nodeId);
  const { solvedIds } = useRoadmapData();

  const currentNode = selectedNode;

  const [width, setWidth] = useState(800);
  const [isMobile, setIsMobile] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current || isMobile) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 700 && newWidth < window.innerWidth * 0.95) {
        setWidth(newWidth);
      }
    },
    [isMobile],
  );

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, [handleMouseMove]);

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      isResizing.current = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    },
    [handleMouseMove, stopResizing, isMobile],
  );

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
                        <div className="flex flex-row items-start justify-between gap-4">
                          <div className="flex flex-col gap-3 items-start">
                            <Badge>
                              Parent: {cat.parent?.name || "Main Topic"}
                            </Badge>
                            <SheetTitle className="text-4xl font-black tracking-tighter text-foreground">
                              {cat.name}
                            </SheetTitle>
                          </div>
                        </div>
                        {cat.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl text-start">
                            {cat.description}
                          </p>
                        )}
                        {currentNode && (currentNode.problemCount || 0) > 0 && (
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-end font-mono">
                              <span className="text-xl font-bold tracking-tighter text-primary">
                                {currentNode.solvedCount || 0}
                              </span>
                              <span className="text-sm text-muted-foreground font-medium ml-1">
                                / {currentNode.problemCount}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary overflow-hidden rounded-full">
                              <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{
                                  width: `${Math.min(100, ((currentNode.solvedCount || 0) / currentNode.problemCount) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
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
                            {cat.problems.map((prob) => {
                              const isSolved = solvedIds.has(prob.problem_id);
                              return (
                                <TableRow
                                  key={prob.problem_id}
                                  className={cn(
                                    "group border-t border-border/50 transition-colors hover:bg-muted/30",
                                    isSolved && "bg-difficulty-easy",
                                  )}
                                >
                                  <TableCell className="pl-4 pr-0 md:pr-4 py-3 align-middle text-xs text-muted-foreground">
                                    {prob.problem_id || "-:-"}
                                  </TableCell>
                                  <TableCell className="px-0 md:px-4 py-3 align-middle min-w-0">
                                    <div className="flex flex-col min-w-0">
                                      <div className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors min-w-0">
                                        <Link
                                          href={
                                            prob.is_premium
                                              ? `https://leetcode.com/problems/${prob.problem_slug}`
                                              : `/problems/${prob.problem_slug}?from=roadmap`
                                          }
                                          target={
                                            prob.is_premium
                                              ? "_blank"
                                              : undefined
                                          }
                                          rel={
                                            prob.is_premium
                                              ? "noopener noreferrer"
                                              : undefined
                                          }
                                          className="flex min-w-0 max-w-full"
                                        >
                                          {" "}
                                          <Button
                                            className={cn(
                                              "p-0 text-foreground/90 group-hover:text-primary flex items-center max-w-full justify-start min-w-0",
                                              isSolved &&
                                                "text-difficulty-easy",
                                            )}
                                            variant="link"
                                          >
                                            <span className="truncate">
                                              {prob.title}
                                            </span>
                                            {prob.is_premium && (
                                              <TooltipProvider
                                                delayDuration={0}
                                              >
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <span
                                                      className="flex items-center ml-2 gap-1 text-difficulty-medium shrink-0"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                    >
                                                      <Lock className="h-3.5 w-3.5" />
                                                      <ExternalLink className="h-3 w-3 opacity-70 hidden lg:block" />
                                                    </span>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="text-left">
                                                    <p>
                                                      We don't have this
                                                      problem. Please click to
                                                      visit LeetCode
                                                      <br /> and solve. It's a
                                                      premium LeetCode problem.
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </Button>
                                        </Link>
                                        {isSolved && (
                                          <CheckCircle2 className="h-4 w-4 text-difficulty-easy shrink-0" />
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 align-middle text-right md:text-left">
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
