import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { type ExecutionVerdict } from "@/types/submission";

export interface StatusTheme {
  icon: React.ElementType;
  label: string;
  badgeClass: string;
  textColor: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

export const STATUS_CONFIG: Record<
  ExecutionVerdict | "PENDING" | "RUNNING",
  StatusTheme
> = {
  ACCEPTED: {
    icon: CheckCircle2,
    label: "Accepted",
    badgeClass:
      "bg-status-accepted text-status-accepted border-status-accepted",
    textColor: "text-status-accepted",
    variant: "outline",
  },
  WRONG_ANSWER: {
    icon: XCircle,
    label: "Wrong Answer",
    badgeClass:
      "bg-status-wrong-answer text-status-wrong-answer border-status-wrong-answer",
    textColor: "text-status-wrong-answer",
    variant: "destructive",
  },
  TLE: {
    icon: Clock,
    label: "Time Limit",
    badgeClass: "bg-status-tle text-status-tle border-status-tle",
    textColor: "text-status-tle",
    variant: "outline",
  },
  RUNTIME_ERROR: {
    icon: AlertCircle,
    label: "Runtime Error",
    badgeClass:
      "bg-status-runtime-error text-status-runtime-error border-status-runtime-error",
    textColor: "text-status-runtime-error",
    variant: "secondary",
  },
  COMPILATION_ERROR: {
    icon: AlertCircle,
    label: "Compile Error",
    badgeClass:
      "bg-status-compile-error text-status-compile-error border-status-compile-error",
    textColor: "text-status-compile-error",
    variant: "secondary",
  },
  SYSTEM_ERROR: {
    icon: AlertCircle,
    label: "System Error",
    badgeClass:
      "bg-status-system-error text-status-system-error border-status-system-error",
    textColor: "text-status-system-error",
    variant: "secondary",
  },
  PENDING: {
    icon: Loader2,
    label: "Pending",
    badgeClass:
      "bg-status-pending text-status-pending border-status-pending",
    textColor: "text-status-pending",
    variant: "outline",
  },
  RUNNING: {
    icon: RefreshCw,
    label: "Running",
    badgeClass:
      "bg-status-pending text-status-pending border-status-pending",
    textColor: "text-status-pending",
    variant: "outline",
  },
};
