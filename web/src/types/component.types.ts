import * as React from "react";
import type { Problem, ProblemTest } from "@/types/api";
import type { ArenaPlayer, ArenaPlayerResult, ArenaRoom } from "@/types/arena";
import type { ExecutionVerdict, ExecutionTestResult, RunSubmissionResponse, Submission } from "@/types/submission";

// Container.tsx
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// ProblemFilters.tsx
export type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

export interface ProblemFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (value: DifficultyFilter) => void;
  topicFilter: string;
  setTopicFilter: (value: string) => void;
  onReset: () => void;
  isSelectPage: boolean;
}

// ArenaLobby.tsx
export interface ArenaLobbyProps {
  roomId: string;
}

// ArenaPlayerCard.tsx
export interface ArenaPlayerCardProps {
  player: ArenaPlayer;
  isHost?: boolean;
  canKick?: boolean;
  onKick?: (userId: string) => void;
}

// MatchWorkspace.tsx
export interface MatchWorkspaceProps {
  problem: Problem;
  roomId: string;
}

// MatchOverOverlay.tsx
export interface MatchOverOverlayProps {
  roomId: string;
  isOpen: boolean;
  onViewResults?: () => void;
  playersCount: number;
}

// MatchResults.tsx
export interface MatchResultsProps {
  rankings: ArenaPlayerResult[];
  isHost: boolean;
  onClose: () => void;
}

// MatchTimer.tsx
export type SlidingNumberProps = {
  value: number;
}

export interface MatchTimerProps {
  endTime: number | string;
}

// ArenaSelectionBanner.tsx
export interface ArenaSelectionBannerProps {
  roomId?: string;
}

// LanguageSelectDialog.tsx
export interface LanguageSelectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  problem: Problem | null;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onConfirm: () => void;
  isActionLoading: boolean;
}

// PracticeProblemList.tsx
export interface PracticeProblemListProps {
  isSelectPage?: boolean;
  roomId?: string;
}

// ProblemPagination.tsx
export interface ProblemPaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number | ((p: number) => number)) => void;
}

// ProblemRow.tsx
export interface ProblemRowProps {
  problem: Problem;
  isSelectPage: boolean;
  onSelect: () => void;
  isHosting: boolean;
}

// ProblemTable.tsx
export interface ProblemTableProps {
  problems: Problem[];
  isLoading: boolean;
  error: any;
  isSelectPage: boolean;
  onSelect: (problem: Problem) => void;
  selectingId: string | null;
  isHosting: boolean;
  isUpdating: boolean;
  topicFilter: string;
}

// ProblemWorkspace.tsx
export interface ProblemWorkspaceProps {
  problem: Problem;
}

// BaseWorkspace.tsx
export interface BaseWorkspaceProps {
  problem: Problem;
  descriptionSlot: React.ReactNode;
  editorSlot: React.ReactNode;
  onRun: () => void;
  onSubmit: () => void;
  onExit?: () => void;
  onAbort?: () => void;
  exitText?: string;
  endTime?: number | string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
  confirmSubmit?: boolean;
}

// ConsolePanel.tsx
export interface ConsolePanelProps {
  tests: ProblemTest | null;
  isLoading: boolean;
  error: Error | null;
  initialTab?: "testcase" | "result";
  runResult?: RunSubmissionResponse | null;
  runResultLoading?: boolean;
  runError?: Error | string | null;
  verdict?: ExecutionVerdict | "PENDING" | null;
  isEvaluating?: boolean;
  pollingTests?: ExecutionTestResult[] | null;
  hasSubmitted?: boolean;
}

// DescriptionPanel.tsx
export interface DescriptionPanelProps {
  problem: Problem;
  mode?: "practice" | "arena";
  room?: ArenaRoom | null;
  currentUserId?: string | null;
  roomId?: string;
}

// EditorPanel.tsx
export interface EditorPanelProps {
  problem: Problem;
  mode?: "practice" | "arena";
  runResult?: RunSubmissionResponse | null;
  isRunning?: boolean;
  runError?: Error | string | null;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  enforcedLanguage?: string;
  roomId?: string;
  verdict?: ExecutionVerdict | "PENDING" | null;
  isEvaluating?: boolean;
  pollingTests?: ExecutionTestResult[] | null;
  hasSubmitted?: boolean;
}

// LanguageSelector.tsx
export interface LanguageOption {
  id: string;
  name: string;
  label?: string; // some hooks return label, some components expect name
  icon?: React.ReactNode;
}

export interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  languages: LanguageOption[];
}

// OpponentsPanel.tsx
export interface OpponentsPanelProps {
  roomId: string;
}

// SolutionViewer.tsx
export interface SolutionViewerProps {
  content?: string;
}

// SubmissionHistory.tsx
export interface SubmissionHistoryProps {
  submissions: Submission[];
  isLoading: boolean;
  error: any;
}

// TestCaseField.tsx
export interface TestCaseFieldProps {
  label: string;
  value: string;
  isOutput?: boolean;
}

// WorkspaceHeader.tsx
export interface WorkspaceHeaderProps {
  problem: Problem;
  onRun?: () => void;
  onSubmit?: () => void;
  onExit?: () => void;
  onAbort?: () => void;
  exitText?: string;
  endTime?: number | string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
  confirmSubmit?: boolean;
}