import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
<<<<<<< HEAD
=======
  Terminal,
>>>>>>> prod-deploy
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
<<<<<<< HEAD
  ExecutionVerdict | "PENDING" | "RUNNING",
=======
  ExecutionVerdict | "PENDING" | "RUNNING" | "IDLE",
>>>>>>> prod-deploy
  StatusTheme
> = {
  ACCEPTED: {
    icon: CheckCircle2,
    label: "Accepted",
    badgeClass:
<<<<<<< HEAD
      "bg-status-accepted text-status-accepted border-status-accepted/20",
=======
      "bg-status-accepted text-status-accepted border-status-accepted",
>>>>>>> prod-deploy
    textColor: "text-status-accepted",
    variant: "outline",
  },
  WRONG_ANSWER: {
    icon: XCircle,
    label: "Wrong Answer",
    badgeClass:
<<<<<<< HEAD
      "bg-status-wrong-answer text-status-wrong-answer border-status-wrong-answer/20",
=======
      "bg-status-wrong-answer text-status-wrong-answer border-status-wrong-answer",
>>>>>>> prod-deploy
    textColor: "text-status-wrong-answer",
    variant: "destructive",
  },
  TLE: {
    icon: Clock,
    label: "Time Limit",
<<<<<<< HEAD
    badgeClass: "bg-status-tle text-status-tle border-status-tle/20",
=======
    badgeClass: "bg-status-tle text-status-tle border-status-tle",
>>>>>>> prod-deploy
    textColor: "text-status-tle",
    variant: "outline",
  },
  RUNTIME_ERROR: {
    icon: AlertCircle,
    label: "Runtime Error",
    badgeClass:
<<<<<<< HEAD
      "bg-status-runtime-error text-status-runtime-error border-status-runtime-error/20",
=======
      "bg-status-runtime-error text-status-runtime-error border-status-runtime-error",
>>>>>>> prod-deploy
    textColor: "text-status-runtime-error",
    variant: "secondary",
  },
  COMPILATION_ERROR: {
    icon: AlertCircle,
    label: "Compile Error",
    badgeClass:
<<<<<<< HEAD
      "bg-status-compile-error text-status-compile-error border-status-compile-error/20",
=======
      "bg-status-compile-error text-status-compile-error border-status-compile-error",
>>>>>>> prod-deploy
    textColor: "text-status-compile-error",
    variant: "secondary",
  },
  SYSTEM_ERROR: {
    icon: AlertCircle,
    label: "System Error",
    badgeClass:
<<<<<<< HEAD
      "bg-status-system-error text-status-system-error border-status-system-error/20",
=======
      "bg-status-system-error text-status-system-error border-status-system-error",
>>>>>>> prod-deploy
    textColor: "text-status-system-error",
    variant: "secondary",
  },
  PENDING: {
    icon: Loader2,
    label: "Pending",
    badgeClass:
<<<<<<< HEAD
      "bg-status-pending text-status-pending border-status-pending/20",
=======
      "bg-status-pending text-status-pending border-status-pending",
>>>>>>> prod-deploy
    textColor: "text-status-pending",
    variant: "outline",
  },
  RUNNING: {
    icon: RefreshCw,
    label: "Running",
    badgeClass:
<<<<<<< HEAD
      "bg-status-pending text-status-pending border-status-pending/20",
    textColor: "text-status-pending",
    variant: "outline",
  },
=======
      "bg-status-pending text-status-pending border-status-pending",
    textColor: "text-status-pending",
    variant: "outline",
  },
  IDLE: {
    icon: Terminal,
    label: "Ready",
    badgeClass: "bg-muted text-muted-foreground border-border",
    textColor: "text-muted-foreground",
    variant: "outline",
  },
>>>>>>> prod-deploy
};
