import { useEffect, useState, useRef, useCallback } from "react";
import { submissionService } from "@/services/submission.service";
import type { ExecutionVerdict, ExecutionTestResult } from "@/services/submission.service";

/**
 * Submission status polling state
 */
export interface SubmissionStatusState {
  status: ExecutionVerdict | "PENDING" | null;
  tests: ExecutionTestResult[] | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseSubmissionStatusOptions {
  /** Poll interval in milliseconds (default: 500ms) - used as base for adaptive polling */
  pollInterval?: number;
  /** Auto-start polling (default: true) */
  autoStart?: boolean;
  /** Max polling duration in milliseconds (default: 60000 = 60 seconds) */
  pollTimeoutMs?: number;
  /** Enable adaptive polling that adjusts interval based on elapsed time (default: true) */
  adaptivePolling?: boolean;
}

/**
 * Hook for polling submission status
 * 
 * Polls the submission status endpoint at adaptive intervals (200ms-2000ms).
 * Automatically stops polling when:
 * - Status is no longer PENDING AND tests are populated
 * - 60 seconds have elapsed (configurable timeout)
 * 
 * @param submissionId - MongoDB submission document ID
 * @param options - Configuration options for polling behavior
 * @returns Current submission status, tests, loading state, and error
 * 
 * @example
 * const { status, tests, isLoading, error } = useSubmissionStatus(submissionId)
 * 
 * if (isLoading) return <p>⏳ Evaluating...</p>
 * if (error) return <p>Error: {error.message}</p>
 * if (status === 'ACCEPTED') return <p>✅ Accepted!</p>
 */
export const useSubmissionStatus = (
  submissionId: string | null,
  options: UseSubmissionStatusOptions = {},
): SubmissionStatusState => {
  const { 
    pollInterval = 500, 
    autoStart = true,
    pollTimeoutMs = 60000, // 60 seconds
    adaptivePolling = true,
  } = options;

  const [state, setState] = useState<SubmissionStatusState>({
    status: null,
    tests: null,
    isLoading: autoStart && !!submissionId,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const startTimeRef = useRef<number | null>(null);

  /**
   * Calculate adaptive poll interval based on elapsed time
   * Starts fast (200ms) and gradually slows down (2000ms max)
   */
  const getAdaptiveInterval = useCallback((elapsedMs: number): number => {
    if (!adaptivePolling) return pollInterval;

    if (elapsedMs < 2000) return 200;      // First 2 sec: aggressive (catch quick wins)
    if (elapsedMs < 5000) return 500;      // 2-5 sec: normal pace
    if (elapsedMs < 10000) return 1000;    // 5-10 sec: relaxed
    return 2000;                            // 10+ sec: lazy (but keep polling)
  }, [adaptivePolling, pollInterval]);

  /**
   * Fetch current submission status from API
   */
  const fetchStatus = useCallback(async () => {
    if (!submissionId || !startTimeRef.current) return;

    try {
      const elapsedMs = Date.now() - startTimeRef.current;

      // Check if polling timeout has been exceeded
      if (elapsedMs > pollTimeoutMs) {
        if (!isMountedRef.current) return;
        const timeoutError = new Error(
          `Submission evaluation timed out after ${pollTimeoutMs / 1000} seconds`
        );
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: timeoutError,
        }));
        // Stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const submission = await submissionService.getSubmissionStatus(submissionId);

      if (!isMountedRef.current) return;

      const tests = submission.details?.tests || null;
      const hasTests = Array.isArray(tests) && tests.length > 0;
      const isComplete = submission.status !== "PENDING" && hasTests;

      setState({
        status: submission.status as ExecutionVerdict | "PENDING",
        tests,
        isLoading: false,
        error: null,
      });

      // Only stop polling when BOTH conditions are true:
      // 1. Status is no longer PENDING
      // 2. Tests have been populated (not empty)
      // This prevents race condition where status updates before tests are saved to DB
      if (isComplete && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error("Failed to fetch submission status");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));

      // Stop polling on error
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [submissionId, pollTimeoutMs]);

  /**
   * Start polling for status updates with adaptive intervals
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current || !submissionId) return;

    // Record start time for timeout and adaptive interval calculation
    startTimeRef.current = Date.now();

    // Fetch immediately, then start interval with adaptive behavior
    fetchStatus();
    
    // For adaptive polling, we need to dynamically adjust the interval
    // by checking elapsed time before each poll
    const pollAndReschedule = async () => {
      if (!startTimeRef.current) return;
      
      const elapsedMs = Date.now() - startTimeRef.current;
      const nextInterval = getAdaptiveInterval(elapsedMs);
      
      // Clear old interval and set new one with updated interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null; // ← MUST set to null for reschedule to work
      }
      
      // Do the fetch
      await fetchStatus();
      
      // Reschedule with potentially different interval
      if (intervalRef.current === null && isMountedRef.current) {
        intervalRef.current = setInterval(pollAndReschedule, nextInterval);
      }
    };

    intervalRef.current = setInterval(pollAndReschedule, getAdaptiveInterval(0));
  }, [submissionId, fetchStatus, getAdaptiveInterval]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Setup polling on mount or when submissionId changes
   */
  useEffect(() => {
    isMountedRef.current = true;
    startTimeRef.current = null; // Reset start time for new submission

    if (autoStart && submissionId) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [submissionId, autoStart, startPolling, stopPolling]);

  return state;
};
