import React from "react";
import type { ExecutionVerdict } from "@/services/submission.service";
import {
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

interface VerdictBadgeProps {
  status: ExecutionVerdict | "PENDING" | null;
  isLoading?: boolean;
  compact?: boolean;
}

/**
 * Displays submission verdict with appropriate styling and emoji
 * 
 * @param status - Current submission status
 * @param isLoading - Whether actively evaluating (shows animated icon)
 * @param compact - Use compact display (fewer details)
 * 
 * @example
 * <VerdictBadge status="ACCEPTED" />
 * <VerdictBadge status="PENDING" isLoading />
 */
export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  status,
  isLoading = false,
  compact = false,
}) => {
  if (!status) {
    return null;
  }

  // Status configuration: color, icon, label
  const verdictConfig: Record<
    ExecutionVerdict | "PENDING",
    { color: string; bgColor: string; Icon: LucideIcon; label: string }
  > = {
    PENDING: {
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      Icon: Hourglass,
      label: "Evaluating...",
    },
    ACCEPTED: {
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      Icon: CheckCircle2,
      label: "Accepted",
    },
    WRONG_ANSWER: {
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      Icon: XCircle,
      label: "Wrong Answer",
    },
    COMPILATION_ERROR: {
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      Icon: AlertTriangle,
      label: "Compilation Error",
    },
    RUNTIME_ERROR: {
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      Icon: Zap,
      label: "Runtime Error",
    },
    TLE: {
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      Icon: Clock,
      label: "Time Limit Exceeded",
    },
    SYSTEM_ERROR: {
      color: "text-red-600",
      bgColor: "bg-red-600/10",
      Icon: AlertCircle,
      label: "System Error",
    },
  };

  const config = verdictConfig[status];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor}`}
      >
        <config.Icon
          className={`w-3.5 h-3.5 ${config.color} ${
            isLoading && status === "PENDING" ? "animate-pulse" : ""
          }`}
        />
        <span className={config.color}>{config.label}</span>
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${config.bgColor} border-${config.color.split('-')[1]}-200 dark:border-${config.color.split('-')[1]}-800`}>
      <config.Icon
        className={`w-8 h-8 ${config.color} ${
          isLoading && status === "PENDING" ? "animate-bounce" : ""
        }`}
      />
      <div className="flex flex-col gap-1">
        <p className={`font-semibold ${config.color}`}>{config.label}</p>
        {status === "PENDING" && (
          <p className="text-xs text-muted-foreground">
            Evaluating your submission...
          </p>
        )}
        {status === "ACCEPTED" && (
          <p className="text-xs text-green-600 dark:text-green-400">
            All test cases passed!
          </p>
        )}
        {status === "WRONG_ANSWER" && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Some test cases failed. Check the output below.
          </p>
        )}
        {(status === "COMPILATION_ERROR" || status === "RUNTIME_ERROR") && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Code encountered an error. Check the output below.
          </p>
        )}
      </div>
    </div>
  );
};
