"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Zap,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryTreeNode } from "@/types/taxonomy";

interface TaxonomyNodeData extends CategoryTreeNode {
  depth: number;
  isExpanded: boolean;
  isActive: boolean;
  isRoot: boolean;
  direction?: "TB" | "LR";
}

const TaxonomyNode = ({ data, selected }: NodeProps<TaxonomyNodeData>) => {
  const isLeaf = !data.children || data.children.length === 0;
  const isLR = data.direction === "LR";

  return (
    <div className="group relative">
      {/* Target Handle */}
      <Handle
        type="target"
        position={isLR ? Position.Left : Position.Top}
        className={cn(
          "!bg-primary/20 !border-none !rounded-none",
          isLR ? "!w-2 !h-8 !py-5" : "!w-8 !h-2 !px-5"
        )}
      />

      <div
        className={cn(
          "transition-all duration-500",
          data.isActive ? "scale-110" : "scale-100",
        )}
      >
        <Card
          className={cn(
            "min-w-[480px] transition-all duration-500 border-2 border-primary/50 relative overflow-hidden",
            data.isActive
              ? "border-primary bg-card"
              : "hover:border-primary bg-card shadow-2xl",
          )}
        >
          <CardContent className="p-10 relative z-10">
            <div className="flex items-center justify-between gap-6">
              <h3
                className={cn(
                  "font-bold  transition-colors",
                  data.isRoot ? "text-[40px]" : "text-[32px]",
                  data.isActive
                    ? "text-foreground"
                    : "text-foreground/80 group-hover:text-primary/80",
                )}
              >
                {data.name}
              </h3>

              {!isLeaf && (
                <div
                  className={cn(
                    "p-2 rounded-full transition-all duration-500 shrink-0",
                    data.isExpanded
                      ? "bg-primary/20 text-primary group-hover:bg-primary/10 group-hover:text-primary"
                      : "bg-muted text-foreground group-hover:text-primary",
                  )}
                >
                  {data.isExpanded ? (
                    <ChevronDown className="w-8 h-8" />
                  ) : (
                    <ChevronRight className="w-8 h-8" />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={isLR ? Position.Right : Position.Bottom}
        className={cn(
          "!bg-primary/20 !border-none !rounded-none",
          isLR ? "!w-2 !h-8 !py-5" : "!w-8 !h-2 !px-5"
        )}
      />
    </div>
  );
};

export default memo(TaxonomyNode);
