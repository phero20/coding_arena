import React from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/domain/status";
import type { ExecutionVerdict } from "@/types/submission";
import { cn } from "@/lib/utils";

export interface VerdictBadgeProps {
  verdict?: string | ExecutionVerdict;
  className?: string;
  iconSize?: number;
}

// Ensure all backend formats map cleanly to our frontend domain STATUS_CONFIG properties
const VERDICT_MAP: Record<string, keyof typeof STATUS_CONFIG> = {
  ACCEPTED: "ACCEPTED",
  WRONG_ANSWER: "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "RUNTIME_ERROR",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  COMPILATION_ERROR: "COMPILATION_ERROR",
  SKIPPED: "PENDING",
  NOT_SUBMITTED: "NOT_SUBMITTED",
};

export const VerdictBadge = ({
  verdict = "SYSTEM_ERROR",
  className,
  iconSize = 12,
}: VerdictBadgeProps) => {
  const normalizedVerdict = typeof verdict === "string" ? verdict.toUpperCase() : "SYSTEM_ERROR";
  const mappedVerdict = VERDICT_MAP[normalizedVerdict] || normalizedVerdict;
  
  const status = mappedVerdict as ExecutionVerdict;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["SYSTEM_ERROR"];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-none whitespace-nowrap flex items-center gap-1 w-[80px] md:w-fit p-1.5 md:p-2 overflow-hidden",
        config.badgeClass,
        className
      )}
    >
      <Icon 
        className={cn(
          config.textColor,
          "shrink-0"
        )} 
        size={iconSize}
      />
      <span className="truncate">
        {config.label}
      </span>
    </Badge>
  );
};
