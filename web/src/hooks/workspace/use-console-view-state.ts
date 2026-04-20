"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { ConsolePanelProps } from "@/types/component.types";

/**
 * Hook to manage complex tab orchestration and result derivation for ConsolePanel.
 * @param {ConsolePanelProps} props The props from the ConsolePanel component.
 * @returns {object} View state and derived results.
 */
export function useConsoleViewState({
  tests,
  initialTab = "testcase",
  runResult,
  runResultLoading,
  runError,
  verdict,
  isEvaluating,
  pollingTests,
}: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Sync internal activeTab with initialTab prop when it changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Reset result index when new results arrive
  useEffect(() => {
    setActiveResultIndex(0);
  }, [runResult, pollingTests]);

  const cases = useMemo(() => tests?.cases ?? [], [tests]);
  const activeCase = cases[activeIndex] ?? null;

  const effectiveTestResults = runResult?.tests ?? pollingTests ?? [];
  const hasTestResults = effectiveTestResults.length > 0;
  
  const currentStatus = verdict || runResult?.overallStatus;
  const isPending = currentStatus === "PENDING" || verdict === "PENDING";
  const isProcessing = runResultLoading || isEvaluating || isPending;
  const isTabLoading = isProcessing && !hasTestResults;

  const hasValidStatus = currentStatus && currentStatus !== "IDLE" && currentStatus !== "PENDING";
  const showResultsSection = !runError && (hasValidStatus || hasTestResults);

  const isForbiddenError = useMemo(() => {
    if (!runError) return false;
    const msg = typeof runError === "string" ? runError : runError.message;
    const lowerMsg = msg.toLowerCase();
    return msg.includes("403") || lowerMsg.includes("already submitted") || lowerMsg.includes("recorded");
  }, [runError]);

  const activeResult = useMemo(
    () => effectiveTestResults[activeResultIndex] ?? null,
    [effectiveTestResults, activeResultIndex],
  );

  return {
    activeTab,
    setActiveTab,
    activeIndex,
    setActiveIndex,
    activeResultIndex,
    setActiveResultIndex,
    cases,
    activeCase,
    effectiveTestResults,
    hasTestResults,
    currentStatus,
    isPending,
    isProcessing,
    isTabLoading,
    hasValidStatus,
    showResultsSection,
    isForbiddenError,
    activeResult,
  };
}
